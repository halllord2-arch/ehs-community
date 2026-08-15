'use client'

import { useState } from 'react'
import Image from 'next/image'

const INDUSTRIES = ['전체', '제조', '건설', '물류', '화학', '식품', '에너지', '조선', '광업', '기타']

const ROLE_COLOR: Record<string, string> = {
  observer: 'bg-gray-100 text-gray-600',
  contributor: 'bg-green-100 text-green-700',
  verifier: 'bg-blue-100 text-blue-700',
  veteran: 'bg-purple-100 text-purple-700',
  master: 'bg-amber-100 text-amber-700',
}

type Post = {
  id: string
  image_url: string
  description: string
  industry_tag: string
  hazard_type: string
  created_at: string
  users: { name: string; role_level: string } | null
  verifications: { judgment: string }[]
}

export default function HomeFeed({ posts }: { posts: Post[] }) {
  const [industry, setIndustry] = useState('전체')

  const filtered = industry === '전체'
    ? posts
    : posts.filter(p => p.industry_tag === industry)

  return (
    <div>
      {/* 산업별 필터 */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {INDUSTRIES.map(tag => (
            <button
              key={tag}
              onClick={() => setIndustry(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                industry === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {tag}
              {tag !== '전체' && (
                <span className="ml-1 text-xs opacity-70">
                  {posts.filter(p => p.industry_tag === tag).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 그리드 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">아직 검증 완료된 게시물이 없습니다.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map(post => {
            const approvedCount = post.verifications.filter(v => v.judgment === 'appropriate').length
            const roleLevel = post.users?.role_level ?? 'observer'

            return (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* 이미지 */}
                <div className="relative w-full aspect-video bg-gray-100">
                  <Image
                    src={post.image_url}
                    alt="위험요소 이미지"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="p-4">
                  {/* 태그 */}
                  <div className="flex gap-1.5 mb-2">
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                      {post.industry_tag}
                    </span>
                    <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                      {post.hazard_type}
                    </span>
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>

                  {/* 하단: 작성자 + 검증 수 + 날짜 */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 font-medium">{post.users?.name ?? '익명'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_COLOR[roleLevel]}`}>
                        {roleLevel.charAt(0).toUpperCase() + roleLevel.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {approvedCount > 0 && (
                        <span className="text-green-600 font-medium">✓ {approvedCount}명 검증</span>
                      )}
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
