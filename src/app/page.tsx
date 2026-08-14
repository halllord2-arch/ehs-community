import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">EHS 커뮤니티</Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/post/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  + 위험요소 게시
                </Link>
                <Link href="/verify" className="text-sm text-gray-600 hover:text-gray-900">검증 큐</Link>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">마이페이지</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">로그인</Link>
                <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          현장 위험요소를 함께 검증합니다
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          안전관리자들이 현장에서 발견한 위험요소를 공유하고,<br />
          동료 검증자들과 함께 적절성을 판단해 산업 안전 데이터를 축적합니다.
        </p>

        {!user && (
          <div className="flex gap-3 justify-center">
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              지금 참여하기
            </Link>
            <Link href="/login" className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 transition-colors">
              로그인
            </Link>
          </div>
        )}

        {user && (
          <Link href="/post/new" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            위험요소 게시하기
          </Link>
        )}
      </div>

      {/* 기능 카드 */}
      <div className="max-w-5xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-3">📸</div>
          <h3 className="font-semibold text-gray-900 mb-2">위험요소 게시</h3>
          <p className="text-sm text-gray-500">현장 사진과 설명으로 위험요소를 공유하고 즉시 +5 포인트를 받으세요.</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="font-semibold text-gray-900 mb-2">동료 검증</h3>
          <p className="text-sm text-gray-500">같은 산업의 검증자들이 게시물을 검토하고 적절성을 판단합니다.</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="font-semibold text-gray-900 mb-2">등급 & 포인트</h3>
          <p className="text-sm text-gray-500">활동 실적(Activity Record)을 쌓아 Observer → Master 등급까지 성장하세요.</p>
        </div>
      </div>
    </div>
  )
}
