import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const ROLE_LABEL: Record<string, string> = {
  observer: 'Observer', contributor: 'Contributor',
  verifier: 'Verifier', veteran: 'Veteran', master: 'Master',
}
const ROLE_COLOR: Record<string, string> = {
  observer: 'bg-gray-100 text-gray-600',
  contributor: 'bg-green-100 text-green-700',
  verifier: 'bg-blue-100 text-blue-700',
  veteran: 'bg-purple-100 text-purple-700',
  master: 'bg-amber-100 text-amber-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '검증 대기', verified: '검증 완료', rejected: '반려됨', flagged: '신고됨',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  flagged: 'bg-orange-50 text-orange-600 border-orange-200',
}

type PostAuthor = { name: string; role_level: string; company: string; job_role: string }
type VerifUser = { name: string; role_level: string }
type Post = {
  id: string; image_url: string; description: string
  industry_tag: string; hazard_type: string; status: string; created_at: string
  users: PostAuthor | null
}
type Verification = {
  judgment: string; comment: string | null; created_at: string; users: VerifUser | null
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: postRaw }, { data: verifRaw }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, image_url, description, industry_tag, hazard_type, status, created_at, users(name, role_level, company, job_role)')
      .eq('id', id)
      .single(),
    supabase
      .from('verifications')
      .select('judgment, comment, created_at, users(name, role_level)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!postRaw) notFound()

  const post = postRaw as unknown as Post
  const verifications = (verifRaw ?? []) as unknown as Verification[]

  const appropriateCount = verifications.filter(v => v.judgment === 'appropriate').length
  const inappropriateCount = verifications.filter(v => v.judgment === 'inappropriate').length
  const totalCount = verifications.length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            ← 목록으로
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/" className="text-base font-bold text-blue-700">EHS 커뮤니티</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLOR[post.status]}`}>
            {STATUS_LABEL[post.status]}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="relative w-full aspect-video bg-gray-100">
            <Image src={post.image_url} alt="위험요소 이미지" fill className="object-contain" priority />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex gap-2 mb-4">
            <span className="text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">
              {post.industry_tag}
            </span>
            <span className="text-sm bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full font-medium">
              {post.hazard_type}
            </span>
          </div>

          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-5">{post.description}</p>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
              {post.users?.name?.[0] ?? '?'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800">{post.users?.name ?? '알 수 없음'}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[post.users?.role_level ?? 'observer']}`}>
                  {ROLE_LABEL[post.users?.role_level ?? 'observer']}
                </span>
              </div>
              {post.users?.company && (
                <p className="text-xs text-gray-400">{post.users.company} · {post.users.job_role}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            검증 현황
            <span className="ml-2 text-sm font-normal text-gray-400">{totalCount}명 참여</span>
          </h2>

          {totalCount === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 검증에 참여한 사람이 없습니다.</p>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-green-600 font-medium">적절 {appropriateCount}명</span>
                  <span className="text-red-500 font-medium">부적절 {inappropriateCount}명</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                  {appropriateCount > 0 && (
                    <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${(appropriateCount / totalCount) * 100}%` }} />
                  )}
                  {inappropriateCount > 0 && (
                    <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${(inappropriateCount / totalCount) * 100}%` }} />
                  )}
                </div>
              </div>

              {verifications.filter(v => v.comment).map((v, i) => (
                <div key={i} className="flex gap-3 py-3 border-t border-gray-50 first:border-0">
                  <span className={`text-lg mt-0.5`}>{v.judgment === 'appropriate' ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-medium text-gray-700">{v.users?.name ?? '검증자'}</span>
                      <span className={`text-xs px-1 py-0.5 rounded ${ROLE_COLOR[v.users?.role_level ?? 'observer']}`}>
                        {ROLE_LABEL[v.users?.role_level ?? 'observer']}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{v.comment}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(v.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
