import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VerifyQueue from '@/components/VerifyQueue'

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('industry_tags, verifier_eligible, total_points')
    .eq('id', user.id)
    .single()

  // 내 산업 태그 우선 + 본인 게시물 제외 + 미검증 게시물
  const myTags = profile?.industry_tags ?? []

  const { data: myVerifiedIds } = await supabase
    .from('verifications')
    .select('post_id')
    .eq('verifier_id', user.id)

  const excludeIds = [
    ...(myVerifiedIds?.map(v => v.post_id) ?? []),
  ]

  let query = supabase
    .from('posts')
    .select('*, users(name, role_level)')
    .eq('status', 'pending')
    .neq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(20)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: allPosts } = await query

  type PostWithUser = typeof allPosts extends (infer T)[] | null ? T : never

  // 내 산업 태그 우선 정렬
  const sorted = [...(allPosts ?? [])].sort((a: PostWithUser, b: PostWithUser) => {
    const aMatch = myTags.includes((a as { industry_tag: string }).industry_tag) ? 0 : 1
    const bMatch = myTags.includes((b as { industry_tag: string }).industry_tag) ? 0 : 1
    return aMatch - bMatch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">EHS 커뮤니티</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/post/new" className="text-gray-600 hover:text-gray-900">+ 게시</Link>
            <Link href="/verify" className="text-blue-600 font-medium">검증 큐</Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">마이페이지</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">검증 큐</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {myTags.length > 0 ? `${myTags.join(', ')} 분야 우선 노출` : '전체 산업 게시물'}
            </p>
          </div>
          <span className="text-sm text-gray-400">{sorted.length}건 대기 중</span>
        </div>

        <VerifyQueue
          initialPosts={sorted as Parameters<typeof VerifyQueue>[0]['initialPosts']}
          verifierEligible={profile?.verifier_eligible ?? false}
          totalPoints={profile?.total_points ?? 0}
        />
      </div>
    </div>
  )
}
