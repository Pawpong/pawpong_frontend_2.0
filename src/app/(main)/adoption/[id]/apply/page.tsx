'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AsyncState, DetailLink } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { useAuthStatus } from '@/features/auth'
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
  const { userRole } = useAuthStatus()

  // 입양 신청은 입양자 전용이다(서버 403). 상세의 신청 버튼은 브리더에게 내려가 있지만,
  // 주소로 바로 들어와도 신청서를 다 쓴 뒤에야 막히지 않게 여기서 먼저 알린다.
  if (userRole === 'breeder') {
    return (
      <AsyncState
        status="empty"
        message="입양 신청은 입양자만 할 수 있어요."
        action={
          <DetailLink href={`/adoption/${petId}`} label="분양글로 돌아가기" className="min-h-11" />
        }
        className="min-h-[calc(100dvh-3rem)] tab:min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

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

  return <ApplicationForm detail={mapAdoptionDetail(data)} />
}

export default AdoptionApplyPage
