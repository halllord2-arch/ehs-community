'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INDUSTRY_OPTIONS = ['제조', '건설', '물류', '화학', '식품', '에너지', '조선', '광업', '기타']
const JOB_ROLE_OPTIONS = ['안전', '보건', '환경', '기타']
const CAREER_OPTIONS = [
  { value: 1, label: '1년 미만' },
  { value: 2, label: '1~3년' },
  { value: 5, label: '3~5년' },
  { value: 8, label: '5~10년' },
  { value: 15, label: '10년 이상' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    company: '',
    job_roles: [] as string[],
    career_years: 0,
    industry_tags: [] as string[],
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      // Google에서 받아온 이름 미리 채우기
      const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
      setForm(prev => ({ ...prev, name }))
    })
  }, [router])

  function toggleJobRole(role: string) {
    setForm(prev => ({
      ...prev,
      job_roles: prev.job_roles.includes(role)
        ? prev.job_roles.filter(r => r !== role)
        : [...prev.job_roles, role],
    }))
  }

  function toggleIndustry(tag: string) {
    setForm(prev => ({
      ...prev,
      industry_tags: prev.industry_tags.includes(tag)
        ? prev.industry_tags.filter(t => t !== tag)
        : [...prev.industry_tags, tag],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.company.trim()) { setError('회사명을 입력해주세요.'); return }
    if (form.job_roles.length === 0) { setError('직무를 하나 이상 선택해주세요.'); return }
    if (form.career_years === 0) { setError('경력을 선택해주세요.'); return }
    if (form.industry_tags.length === 0) { setError('산업 분야를 하나 이상 선택해주세요.'); return }

    setLoading(true)

    const res = await fetch('/api/auth/setup-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        name: form.name,
        company: form.company,
        job_role: form.job_roles.join(', '),
        career_years: form.career_years,
        industry_tags: form.industry_tags,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '저장에 실패했습니다.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">프로필 완성</h1>
          <p className="text-sm text-gray-500">
            EHS 커뮤니티 이용을 위해 추가 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사명 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(주)예시기업"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직무 <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(중복 선택 가능)</span></label>
            <div className="flex flex-wrap gap-2">
              {JOB_ROLE_OPTIONS.map(role => (
                <button key={role} type="button" onClick={() => toggleJobRole(role)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.job_roles.includes(role) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">경력 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {CAREER_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, career_years: opt.value }))}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.career_years === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">담당 산업 분야 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleIndustry(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.industry_tags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
