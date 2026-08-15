'use client'

import { useState } from 'react'
import Link from 'next/link'

const INDUSTRY_OPTIONS = ['제조', '건설', '물류', '화학', '식품', '에너지', '조선', '광업', '기타']
const JOB_ROLE_OPTIONS = ['안전', '보건', '환경', '기타']


const CAREER_OPTIONS = [
  { value: 1, label: '1년 미만' },
  { value: 2, label: '1~3년' },
  { value: 5, label: '3~5년' },
  { value: 8, label: '5~10년' },
  { value: 15, label: '10년 이상' },
]

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    job_roles: [] as string[],
    career_years: 0,
    industry_tags: [] as string[],
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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


    if (!form.company.trim()) {
      setError('회사명을 입력해주세요.')
      return
    }
    if (form.job_roles.length === 0) {
      setError('직무를 하나 이상 선택해주세요.')
      return
    }
    if (form.career_years === 0) {
      setError('경력을 선택해주세요.')
      return
    }
    if (form.industry_tags.length === 0) {
      setError('산업 분야를 하나 이상 선택해주세요.')
      return
    }

    setLoading(true)

    // 모든 처리를 서버 API에서 수행 → 브라우저 ISO-8859-1 헤더 제한 우회
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        name: form.name,
        company: form.company,
        job_role: form.job_roles.join(', '),
        career_years: form.career_years,
        industry_tags: form.industry_tags,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '회원가입에 실패했습니다.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">회원가입 완료!</h2>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{form.email}</strong> 으로 가입되었습니다.<br />
            바로 로그인할 수 있습니다.
          </p>
          <Link href="/login" className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">회원가입</h1>
        <p className="text-sm text-gray-500 mb-3">안전관리자 커뮤니티에 참여하세요</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
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

          {/* 회사 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6자 이상"
            />
          </div>

          {/* 회사명 */}
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

          {/* 직무 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직무 <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(중복 선택 가능)</span></label>
            <div className="flex flex-wrap gap-2">
              {JOB_ROLE_OPTIONS.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleJobRole(role)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.job_roles.includes(role)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* 경력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">경력 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {CAREER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, career_years: opt.value }))}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.career_years === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 산업 분야 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">담당 산업 분야 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleIndustry(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    form.industry_tags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>
        </p>
        <p className="mt-3 text-xs text-center text-gray-400">
          가입하면{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">개인정보처리방침</Link>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  )
}
