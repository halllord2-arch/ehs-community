import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostSuccessToast from '@/components/PostSuccessToast'
import HomeFeed from '@/components/HomeFeed'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, image_url, description, industry_tag, hazard_type, created_at, users(name, role_level), verifications(judgment)')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(60)

  const verifiedPosts = (posts ?? []) as Parameters<typeof HomeFeed>[0]['posts']

  return (
    <div className="min-h-screen bg-gray-50">
      <PostSuccessToast />

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">EHS 커뮤니티</Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/post/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  + 위험요소 게시
                </Link>
                <Link href="/verify" className="text-sm text-gray-600 hover:text-gray-900">검증 큐</Link>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">마이페이지</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">로그인</Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 — 게시물 없을 때만 크게, 있으면 컴팩트 */}
      {verifiedPosts.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">현장 위험요소를 함께 검증합니다</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            안전관리자들이 현장에서 발견한 위험요소를 공유하고,<br />
            동료 검증자들과 함께 적절성을 판단해 산업 안전 데이터를 축적합니다.
          </p>
          {user ? (
            <Link href="/post/new" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              첫 위험요소 게시하기
            </Link>
          ) : (
            <div className="flex gap-3 justify-center">
              <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                지금 참여하기
              </Link>
              <Link href="/login" className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 transition-colors">
                로그인
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-b border-gray-200 px-4 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">검증된 위험요소</h1>
              <p className="text-sm text-gray-500 mt-0.5">안전관리자들이 현장에서 직접 발견하고 검증한 사례</p>
            </div>
            <div className="text-sm text-gray-400">
              총 <strong className="text-gray-700">{verifiedPosts.length}</strong>건
            </div>
          </div>
        </div>
      )}

      {/* 피드 */}
      {verifiedPosts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <HomeFeed posts={verifiedPosts} />
        </div>
      )}

      {/* 미가입자에게 하단 CTA */}
      {!user && verifiedPosts.length > 0 && (
        <div className="bg-blue-600 mt-12 py-10 px-4 text-center">
          <h2 className="text-xl font-bold text-white mb-2">나도 현장 위험요소를 공유하고 싶다면?</h2>
          <p className="text-blue-100 text-sm mb-5">가입하고 게시물을 올리면 즉시 +5 포인트를 받습니다.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            무료 가입하기
          </Link>
        </div>
      )}

      {/* 푸터 */}
      <footer className="border-t border-gray-200 mt-12 py-6 px-4 text-center text-xs text-gray-400">
        <p>© 2026 EHS 커뮤니티. All rights reserved.</p>
        <p className="mt-1">
          <Link href="/privacy" className="hover:text-gray-600 underline">개인정보처리방침</Link>
        </p>
      </footer>
    </div>
  )
}
