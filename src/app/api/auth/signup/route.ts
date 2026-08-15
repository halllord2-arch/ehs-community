import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const {
    email, password, name, company,
    job_role, career_years, industry_tags,
  } = await request.json()

  if (!name || !company || !job_role || !career_years || !industry_tags?.length) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  if (!data.user) {
    return NextResponse.json({ error: '계정 생성에 실패했습니다.' }, { status: 500 })
  }

  const serviceClient = createServiceClient()

  // 이메일 인증 설정과 무관하게 즉시 인증 처리
  if (!data.session) {
    const { error: confirmError } = await serviceClient.auth.admin.updateUserById(
      data.user.id,
      { email_confirm: true }
    )
    if (confirmError) {
      return NextResponse.json({ error: `인증 처리 실패: ${confirmError.message}` }, { status: 500 })
    }
  }

  await serviceClient.from('users').update({
    name, company, job_role, career_years, industry_tags,
  }).eq('id', data.user.id)

  return NextResponse.json({ ok: true })
}
