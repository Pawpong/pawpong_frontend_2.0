'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AsyncState } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionDetail } from '../_lib/mapAdoptionDetail'
import { ApplicationForm } from './_ui/ApplicationForm'

const AdoptionApplyPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  // 신청서에는 브리더/펫 기본 정보만 필요 — 다른 분양건은 조회하지 않는다
  const detailQuery = useQuery({
    ...adoptionQueries.detail(petId),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const { data } = detailQuery

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
        onRetry={() => void detailQuery.refetch()}
        isRetrying={detailQuery.isFetching}
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  return <ApplicationForm detail={mapAdoptionDetail(data)} />
}

export default AdoptionApplyPage
