-- Points config initial seed data
INSERT INTO public.points_config (action_type, point_value, daily_cap) VALUES
  ('post_create',            5,   NULL),
  ('industry_tag_correct',   2,   NULL),
  ('hazard_self_tag',        3,   NULL),
  ('verified_appropriate',   15,  NULL),
  ('ai_match_bonus',         5,   NULL),
  ('help_reaction',          1,   10),
  ('verify_action',          3,   30),
  ('verify_consensus_bonus', 5,   NULL),
  ('duplicate_penalty',      -20, NULL),
  ('low_quality_penalty',    -10, NULL);
