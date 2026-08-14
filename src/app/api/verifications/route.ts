import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Judgment } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { post_id, judgment, comment } = await request.json() as {
    post_id: string
    judgment: Judgment
    comment?: string
  }

  if (!post_id || !judgment) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })
  }

  // 본인 게시물 검증 불가
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', post_id).single()
  if (post?.user_id === user.id) {
    return NextResponse.json({ error: '본인이 게시한 글은 검증할 수 없습니다.' }, { status: 403 })
  }

  // 일일 검증 포인트 한도 확인 (30점)
  const serviceClient = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: todayPoints } = await serviceClient
    .from('point_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('reason', 'verify_action')
    .gte('created_at', `${today}T00:00:00`)

  const todayTotal = todayPoints?.reduce((sum, t) => sum + t.amount, 0) ?? 0
  const { data: config } = await serviceClient
    .from('points_config')
    .select('point_value, daily_cap')
    .eq('action_type', 'verify_action')
    .single()

  const pointValue = config?.point_value ?? 3
  const dailyCap = config?.daily_cap ?? 30
  const canEarnPoint = todayTotal < dailyCap

  // 검증 저장
  const { error: insertError } = await serviceClient
    .from('verifications')
    .insert({ post_id, verifier_id: user.id, judgment, comment: comment ?? null })

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: '이미 검증한 게시물입니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 검증 포인트 지급
  if (canEarnPoint) {
    await serviceClient.from('point_transactions').insert({
      user_id: user.id,
      amount: pointValue,
      reason: 'verify_action',
      related_post_id: post_id,
    })
  }

  // 검증 결과 처리 (상태 확정 + 게시자 포인트)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (serviceClient.rpc as any)('process_verification_result', { p_post_id: post_id })

  return NextResponse.json({ earned: canEarnPoint ? pointValue : 0 })
}
