'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PostRow, UserRow } from '@/types/database'

type PostWithUser = PostRow & { users: Pick<UserRow, 'name' | 'role_level'> | null }

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

export default function VerifyQueue({
  initialPosts,
  verifierEligible,
  totalPoints,
}: {
  initialPosts: PostWithUser[]
  verifierEligible: boolean
  totalPoints: number
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [comment, setComment] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function submitVerification(postId: string, judgment: 'appropriate' | 'inappropriate') {
    setLoading(postId + judgment)
    const res = await fetch('/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, judgment, comment: comment[postId] ?? '' }),
    })
    const json = await res.json()
    setLoading(null)

    if (!res.ok) {
      showToast(json.error ?? '오류가 발생했습니다.')
      return
    }

    setPosts(prev => prev.filter(p => p.id !== postId))
    const earned = json.earned > 0 ? ` (+${json.earned}P)` : ''
    showToast(judgment === 'appropriate' ? `✅ 적절로 판정했습니다.${earned}` : `❌ 부적절로 판정했습니다.${earned}`)
  }

  if (!verifierEligible) {
    const needed = 500 - totalPoints
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">검증 권한이 없습니다</h2>
        <p className="text-sm text-gray-500">
          검증자(Verifier) 등급부터 검증 큐에 참여할 수 있습니다.<br />
          현재 <strong>{totalPoints}P</strong> — 앞으로 <strong>{needed}P</strong> 더 쌓으면 활성화됩니다.
        </p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-gray-500">검증할 게시물이 없습니다. 나중에 다시 확인해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* 이미지 */}
          <div className="relative w-full aspect-video bg-gray-100">
            <Image src={post.image_url} alt="위험요소 이미지" fill className="object-contain" />
          </div>

          <div className="p-5">
            {/* 태그 */}
            <div className="flex gap-2 mb-3">
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                {post.industry_tag}
              </span>
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                {post.hazard_type}
              </span>
            </div>

            {/* 설명 */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.description}</p>

            {/* 게시자 */}
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
              <span>{post.users?.name ?? '알 수 없음'}</span>
              {post.users?.role_level && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_COLOR[post.users.role_level]}`}>
                  {ROLE_LABEL[post.users.role_level]}
                </span>
              )}
              <span>· {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>

            {/* 코멘트 */}
            <textarea
              rows={2}
              value={comment[post.id] ?? ''}
              onChange={e => setComment(prev => ({ ...prev, [post.id]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="판정 사유 (선택사항)"
            />

            {/* 판정 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => submitVerification(post.id, 'appropriate')}
                disabled={loading !== null}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                {loading === post.id + 'appropriate' ? '처리 중...' : '✅ 적절'}
              </button>
              <button
                onClick={() => submitVerification(post.id, 'inappropriate')}
                disabled={loading !== null}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                {loading === post.id + 'inappropriate' ? '처리 중...' : '❌ 부적절'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
