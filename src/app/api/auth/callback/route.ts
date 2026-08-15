import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // next가 명시된 경우(비밀번호 재설정 등)는 그대로 이동
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Google 신규 사용자: company가 비어있으면 온보딩으로
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('company')
        .eq('id', user.id)
        .single()

      if (!profile?.company) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
