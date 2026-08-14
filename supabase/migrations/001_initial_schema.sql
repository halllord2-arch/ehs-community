-- EHS Community MVP - Initial Schema

-- Enums
CREATE TYPE role_level AS ENUM ('observer', 'contributor', 'verifier', 'veteran', 'master');
CREATE TYPE post_status AS ENUM ('pending', 'verified', 'rejected', 'flagged');
CREATE TYPE judgment_type AS ENUM ('appropriate', 'inappropriate');
CREATE TYPE point_reason AS ENUM (
  'post_create',
  'industry_tag_correct',
  'hazard_self_tag',
  'verified_appropriate',
  'ai_match_bonus',
  'help_reaction',
  'verify_action',
  'verify_consensus_bonus',
  'duplicate_penalty',
  'low_quality_penalty'
);

-- Users (extends auth.users)
CREATE TABLE public.users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  industry_tags  TEXT[] NOT NULL DEFAULT '{}',
  role_level     role_level NOT NULL DEFAULT 'observer',
  total_points   INT NOT NULL DEFAULT 0,
  industry_points JSONB NOT NULL DEFAULT '{}',
  verifier_eligible BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts
CREATE TABLE public.posts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url            TEXT NOT NULL,
  image_phash          TEXT,
  description          TEXT NOT NULL CHECK (char_length(description) >= 20),
  industry_tag         TEXT NOT NULL,
  hazard_type          TEXT NOT NULL,
  status               post_status NOT NULL DEFAULT 'pending',
  ai_confidence_score  FLOAT,
  ai_hazard_prediction JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verifications
CREATE TABLE public.verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  judgment    judgment_type NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, verifier_id)
);

-- Point Transactions
CREATE TABLE public.point_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount          INT NOT NULL,
  reason          point_reason NOT NULL,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Points Config (admin-adjustable)
CREATE TABLE public.points_config (
  action_type  TEXT PRIMARY KEY,
  point_value  INT NOT NULL,
  daily_cap    INT
);

-- Indexes
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_industry_tag ON public.posts(industry_tag);
CREATE INDEX idx_posts_image_phash ON public.posts(image_phash) WHERE image_phash IS NOT NULL;
CREATE INDEX idx_verifications_post_id ON public.verifications(post_id);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_config ENABLE ROW LEVEL SECURITY;

-- users: 본인만 수정, 모두 읽기
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- posts: 모두 읽기, 본인만 쓰기
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

-- verifications: 모두 읽기, verifier만 쓰기
CREATE POLICY "verifications_select_all" ON public.verifications FOR SELECT USING (true);
CREATE POLICY "verifications_insert_verifier" ON public.verifications FOR INSERT
  WITH CHECK (
    auth.uid() = verifier_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND verifier_eligible = true)
  );

-- point_transactions: 본인만 읽기
CREATE POLICY "point_tx_select_own" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);

-- points_config: 모두 읽기 (쓰기는 service role만)
CREATE POLICY "points_config_select_all" ON public.points_config FOR SELECT USING (true);

-- Trigger: total_points 업데이트 + 등급 자동 승급
CREATE OR REPLACE FUNCTION update_user_points_and_rank()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.users
  SET
    total_points = total_points + NEW.amount,
    role_level = CASE
      WHEN total_points + NEW.amount >= 5000 THEN 'master'
      WHEN total_points + NEW.amount >= 1500 THEN 'veteran'
      WHEN total_points + NEW.amount >= 500  THEN 'verifier'
      WHEN total_points + NEW.amount >= 100  THEN 'contributor'
      ELSE 'observer'
    END::role_level,
    verifier_eligible = (total_points + NEW.amount >= 500),
    last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_points_and_rank
  AFTER INSERT ON public.point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_points_and_rank();

-- Trigger: 신규 사용자 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: 검증 완료 후 포인트 지급 및 상태 변경
CREATE OR REPLACE FUNCTION process_verification_result(p_post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total        INT;
  v_appropriate  INT;
  v_inappropriate INT;
  v_post         RECORD;
  v_point_value  INT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.verifications WHERE post_id = p_post_id;
  SELECT COUNT(*) INTO v_appropriate FROM public.verifications WHERE post_id = p_post_id AND judgment = 'appropriate';
  SELECT COUNT(*) INTO v_inappropriate FROM public.verifications WHERE post_id = p_post_id AND judgment = 'inappropriate';

  SELECT * INTO v_post FROM public.posts WHERE id = p_post_id;

  IF v_appropriate >= 2 THEN
    UPDATE public.posts SET status = 'verified' WHERE id = p_post_id;

    SELECT point_value INTO v_point_value FROM public.points_config WHERE action_type = 'verified_appropriate';
    INSERT INTO public.point_transactions (user_id, amount, reason, related_post_id)
    VALUES (v_post.user_id, v_point_value, 'verified_appropriate', p_post_id);

  ELSIF v_inappropriate >= 2 THEN
    UPDATE public.posts SET status = 'rejected' WHERE id = p_post_id;

    SELECT point_value INTO v_point_value FROM public.points_config WHERE action_type = 'low_quality_penalty';
    INSERT INTO public.point_transactions (user_id, amount, reason, related_post_id)
    VALUES (v_post.user_id, v_point_value, 'low_quality_penalty', p_post_id);

  ELSIF v_total = 2 AND v_appropriate = 1 AND v_inappropriate = 1 THEN
    NULL; -- 3번째 검증자에게 라우팅 (현재는 pending 유지)
  END IF;
END;
$$;
