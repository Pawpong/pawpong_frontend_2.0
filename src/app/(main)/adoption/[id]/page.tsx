'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { profileQueries } from '@/entities/profile'
import { AdoptionDetailContent } from './_ui/AdoptionDetailContent'
import { mapAdoptionDetail } from './_lib/mapAdoptionDetail'

const AdoptionDetailPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  const { data, isLoading, isError } = useQuery(adoptionQueries.detail(petId))
  // 로그인 사용자 조회 (비로그인 시 undefined) — 브리더 본인 여부 판별용
  const { data: myProfile } = useQuery(profileQueries.me())

  if (isLoading) {
    return (
      <Container className="flex min-h-screen items-center justify-center py-10">
        <p className="text-sm text-neutral-700">불러오는 중...</p>
      </Container>
    )
  }

  if (isError || !data) {
    return (
      <Container className="flex min-h-screen items-center justify-center py-10">
        <p className="text-sm text-neutral-700">분양글을 불러오지 못했습니다.</p>
      </Container>
    )
  }

  const detail = mapAdoptionDetail(data)
  const isOwner = !!myProfile && myProfile.userId === detail.breeder.id

  return <AdoptionDetailContent detail={detail} isOwner={isOwner} />
}

export default AdoptionDetailPage
