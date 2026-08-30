'use client'

import { useParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AsyncState, Button } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { AdoptionDetailContent } from './_ui/AdoptionDetailContent'
import { mapAdoptionDetail } from './_lib/mapAdoptionDetail'

const AdoptionDetailPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  const detailQuery = useQuery({
    ...adoptionQueries.detail(petId),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const { data } = detailQuery
  // 브리더의 다른 분양건 — 상세 응답에 없어 목록 API로 별도 조회(브리더 id를 알아야 하므로 상세 이후)
  const { data: otherPets } = useInfiniteQuery({
    ...adoptionQueries.breederPets(data?.breederId ?? '', petId),
    refetchOnMount: 'always',
    throwOnError: false,
  })

  if (detailQuery.isPending) {
    return (
      <AsyncState
        status="loading"
        message="분양글을 불러오는 중입니다."
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  if (detailQuery.isError || !data) {
    return (
      <AsyncState
        status="error"
        message="분양글을 불러오지 못했습니다."
        action={
          <Button variant="fill" size="sm" onClick={() => void detailQuery.refetch()}>
            다시 시도
          </Button>
        }
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  return <AdoptionDetailContent detail={mapAdoptionDetail(data, otherPets?.pages[0]?.items)} />
}

export default AdoptionDetailPage
