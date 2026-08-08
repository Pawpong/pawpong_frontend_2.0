'use client'

import { useParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { AdoptionDetailContent } from './_ui/AdoptionDetailContent'
import { mapAdoptionDetail } from './_lib/mapAdoptionDetail'

const AdoptionDetailPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  const { data, isLoading, isError } = useQuery(adoptionQueries.detail(petId))
  // 브리더의 다른 분양건 — 상세 응답에 없어 목록 API로 별도 조회(브리더 id를 알아야 하므로 상세 이후)
  const { data: otherPets } = useInfiniteQuery(
    adoptionQueries.breederPets(data?.breederId ?? '', petId),
  )

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

  return <AdoptionDetailContent detail={mapAdoptionDetail(data, otherPets?.pages[0]?.items)} />
}

export default AdoptionDetailPage
