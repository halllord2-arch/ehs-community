import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { RoleLevel } from '@/types/database'
import LogoutButton from '@/components/LogoutButton'

const ROLE_LABEL: Record<RoleLevel, string> = {
  observer: 'Observer', contributor: 'Contributor',
  verifier: 'Verifier', veteran: 'Veteran', master: 'Master',
}
const ROLE_COLOR: Record<RoleLevel, string> = {
  observer: 'bg-gray-100 text-gray-700',
  contributor: 'bg-green-100 text-green-700',
  verifier: 'bg-blue-100 text-blue-700',
  veteran: 'bg-purple-100 text-purple-700',
  master: 'bg-amber-100 text-amber-800',
}
const NEXT_THRESHOLD: Record<RoleLevel, number | null> = {
  observer: 100, contributor: 500, verifier: 1500, veteran: 5000, master: null,
}
const REASON_LABEL: Record<string, string> = {
  post_create: '게시물 작성',
  industry_tag_correct: '산업 태그 정확',
  hazard_self_tag: '위험유형 태그',
  verified_appropriate: '게시물 검증 완료',
  ai_match_bonus: 'AI 일치 보너스',
  help_reaction: '도움 반응',
  verify_action: '검증 참여',
  verify_consensus_bonus: '검증 합의 보너스',
  duplicate_penalty: '중복 게시 패널티',
  low_quality_penalty: '저품질 패널티',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: transactions }, { data: myPosts }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('point_transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('posts').select('id, status, created_at, industry_tag, hazard_type')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!profile) redirect('/login')

  const role = profile.role_level as RoleLevel
  const nextThreshold = NEXT_THRESHOLD[role]
  const progressPct = nextThreshold
    ? Math.min(100, Math.round((profile.total_points / nextThreshold) * 100))
    : 100

  const STATUS_LABEL: Record<string, string> = {
    pending: '검증 대기', verified: '검증 완료', rejected: '반려됨', flagged: '신고됨',
  }
  const STATUS_COLOR: Record<string, string> = {
    pending: 'text-yellow-600', verified: 'text-green-600', rejected: 'text-red-500', flagged: 'text-orange-500',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">EHS 커뮤니티</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/post/new" className="text-gray-600 hover:text-gray-900">+ 게시</Link>
            <Link href="/verify" className="text-gray-600 hover:text-gray-900">검증 큐</Link>
            <Link href="/profile" className="text-blue-600 font-medium">마이페이지</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.company} · {profile.job_role}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ROLE_COLOR[role]}`}>
              {ROLE_LABEL[role]}
            </span>
          </div>

          {/* 포인트 & 진행도 */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">총 포인트</span>
              <span className="font-bold text-blue-600">{profile.total_points.toLocaleString()}P</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            {nextThreshold && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                다음 등급까지 {(nextThreshold - profile.total_points).toLocaleString()}P
              </p>
            )}
          </div>

          {/* 산업별 포인트 */}
          {Object.keys(profile.industry_points ?? {}).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">산업별 활동 실적 (Activity Record)</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(profile.industry_points as Record<string, number>).map(([tag, pts]) => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {tag} {pts}P
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 내 게시물 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">내 게시물</h3>
          {myPosts && myPosts.length > 0 ? (
            <div className="space-y-2">
              {myPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div className="flex gap-2">
                    <span className="text-gray-500">{post.industry_tag}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{post.hazard_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${STATUS_COLOR[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">아직 게시물이 없습니다.</p>
          )}
        </div>

        {/* 포인트 내역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">포인트 내역</h3>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{REASON_LABEL[tx.reason] ?? tx.reason}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${tx.amount > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}P
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">포인트 내역이 없습니다.</p>
          )}
        </div>

        {/* 로그아웃 */}
        <LogoutButton />
      </div>
    </div>
  )
}

