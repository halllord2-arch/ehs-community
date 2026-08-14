'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const INDUSTRY_OPTIONS = ['제조', '건설', '물류', '화학', '식품', '에너지', '조선', '광업', '기타']
const HAZARD_TYPES = ['끼임', '추락', '화재', '화학물질', '전기', '폭발', '질식', '근골격계', '기타']

export default function PostNewPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    description: '',
    industry_tag: '',
    hazard_type: '',
    tos_agreed: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!file) { setError('이미지를 선택해주세요.'); return }
    if (form.description.length < 20) { setError('설명은 20자 이상 입력해주세요.'); return }
    if (!form.industry_tag) { setError('산업 분야를 선택해주세요.'); return }
    if (!form.hazard_type) { setError('위험 유형을 선택해주세요.'); return }
    if (!form.tos_agreed) { setError('데이터 이용약관에 동의해야 게시할 수 있습니다.'); return }

    setLoading(true)

    const data = new FormData()
    data.append('image', file)
    data.append('description', form.description)
    data.append('industry_tag', form.industry_tag)
    data.append('hazard_type', form.hazard_type)
    data.append('tos_agreed', 'true')

    const res = await fetch('/api/posts', { method: 'POST', body: data })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? '게시 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    router.push('/?posted=1')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">위험요소 게시</h1>
        <p className="text-sm text-gray-500 mb-6">현장에서 발견한 위험요소 사진을 공유하고 동료의 검증을 받으세요.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              위험요소 사진 <span className="text-red-500">*</span>
            </label>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              {preview ? (
                <div className="relative w-full aspect-video">
                  <Image src={preview} alt="미리보기" fill className="object-contain rounded" />
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-gray-400 text-sm">클릭하여 이미지 선택</p>
                  <p className="text-gray-300 text-xs mt-1">JPG, PNG, WEBP 지원</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {/* 개인정보 비식별화 안내 - 필수 표시 */}
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              ⚠️ 업로드 전 사진에 포함된 얼굴, 차량번호 등 개인정보를 반드시 가려주세요.
            </p>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위험요소 설명 <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(최소 20자)</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="어떤 위험요소인지 구체적으로 설명해주세요. (예: 사출기 금형 교체 중 안전핀 미체결로 인한 끼임 위험)"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}자 / 최소 20자</p>
          </div>

          {/* 산업 분야 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              산업 분야 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, industry_tag: tag }))}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.industry_tag === tag
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 위험 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              위험 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {HAZARD_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, hazard_type: type }))}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.hazard_type === type
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 데이터 이용약관 동의 - 필수 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-3">
              업로드된 이미지와 설명은 산업별 AI 위험탐지 모델 학습에 활용될 수 있습니다.
              개인정보가 포함되지 않도록 사전에 가려주세요. 기여해주신 데이터의 저작권은
              EHS 커뮤니티 플랫폼과 공유됩니다.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tos_agreed}
                onChange={e => setForm(p => ({ ...p, tos_agreed: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                데이터 이용약관에 동의합니다 <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? '게시 중...' : '게시하기 (+5 포인트)'}
          </button>
        </form>
      </div>
    </div>
  )
}
