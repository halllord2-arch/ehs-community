import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { user_id, name, company, job_role, career_years, industry_tags } = await request.json()

  if (!user_id || !name || !company || !job_role || !career_years || !industry_tags) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })
  }

  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('users')
    .update({ name, company, job_role, career_years, industry_tags })
    .eq('id', user_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
