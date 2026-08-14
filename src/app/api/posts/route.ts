import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { computePHash, isDuplicate } from '@/lib/phash'
import type { PostStatus } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('image') as File | null
  const description = formData.get('description') as string
  const industry_tag = formData.get('industry_tag') as string
  const hazard_type = formData.get('hazard_type') as string
  const tos_agreed = formData.get('tos_agreed') as string

  if (!file || !description || !industry_tag || !hazard_type) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  if (description.length < 20) {
    return NextResponse.json({ error: '설명은 20자 이상 입력해주세요.' }, { status: 400 })
  }

  if (tos_agreed !== 'true') {
    return NextResponse.json({ error: '데이터 이용약관에 동의해야 게시할 수 있습니다.' }, { status: 400 })
  }

  // pHash 중복 검사
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const newHash = await computePHash(buffer)

  const { data: existingPosts } = await supabase
    .from('posts')
    .select('id, image_phash')
    .not('image_phash', 'is', null)

  if (existingPosts) {
    for (const post of existingPosts) {
      if (post.image_phash && isDuplicate(newHash, post.image_phash)) {
        // 중복 패널티 포인트 차감
        const serviceClient = await createServiceClient()
        await serviceClient.from('point_transactions').insert({
          user_id: user.id,
          amount: -20,
          reason: 'duplicate_penalty',
        })
        return NextResponse.json({ error: '유사한 이미지가 이미 존재합니다. 중복 게시는 허용되지 않습니다.' }, { status: 409 })
      }
    }
  }

  // Supabase Storage 업로드
  const ext = file.name.split('.').pop()
  const path = `posts/${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(path, buffer, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)

  // 게시물 저장
  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      image_url: publicUrl,
      image_phash: newHash,
      description,
      industry_tag,
      hazard_type,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: '게시물 저장에 실패했습니다.' }, { status: 500 })
  }

  // 게시 포인트 지급
  const serviceClient = await createServiceClient()
  const { data: pointConfig } = await serviceClient
    .from('points_config')
    .select('point_value')
    .eq('action_type', 'post_create')
    .single()

  await serviceClient.from('point_transactions').insert({
    user_id: user.id,
    amount: pointConfig?.point_value ?? 5,
    reason: 'post_create',
    related_post_id: post.id,
  })

  return NextResponse.json({ post }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry')
  const status = (searchParams.get('status') ?? 'pending') as PostStatus

  let query = supabase
    .from('posts')
    .select('*, users(name, role_level)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (industry) {
    query = query.eq('industry_tag', industry)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts: data })
}
