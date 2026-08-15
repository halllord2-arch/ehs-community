import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const origin = new URL(request.url).origin

  const {
    email, password, name, company,
    job_role, career_years, industry_tags,
  } = await request.json()

  if (!name || !company || !job_role || !career_years || !industry_tags?.length) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  // 서버에서 signUp 호출 → 한글이 서버 fetch에서 처리되므로 ISO-8859-1 제한 없음
  const supabase = await createClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  // 서비스 롤로 프로필 즉시 저장
  if (data.user) {
    const serviceClient = createServiceClient()
    await serviceClient.from('users').update({
      name, company, job_role, career_years, industry_tags,
    }).eq('id', data.user.id)
  }

  return NextResponse.json({ ok: true })
}
