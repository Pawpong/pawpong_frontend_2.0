'use client'

import { useParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AsyncState } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { AdoptionDetailContent } from './AdoptionDetailContent'
import { mapAdoptionDetail } from '../_lib/mapAdoptionDetail'

const AdoptionDetailPageClient = () => {
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
        message="분양글을 불러오는 중이에요."
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  if (detailQuery.isError || !data) {
    return (
      <AsyncState
        status="error"
        message="분양글을 불러오지 못했어요."
        onRetry={() => void detailQuery.refetch()}
        isRetrying={detailQuery.isFetching}
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  return <AdoptionDetailContent detail={mapAdoptionDetail(data, otherPets?.pages[0]?.items)} />
}

export { AdoptionDetailPageClient }
