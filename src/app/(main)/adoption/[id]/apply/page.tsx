'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { adopterQueries } from '@/entities/adopter'
import { mapAdoptionDetail } from '../_lib/mapAdoptionDetail'
import { ApplicationForm } from './_ui/ApplicationForm'

const AdoptionApplyPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  // 신청서에는 브리더/펫 기본 정보만 필요 — 다른 분양건은 조회하지 않는다
  const { data, isLoading, isError } = useQuery(adoptionQueries.detail(petId))
  // 조사 문항 노출 여부(counselDefaultProfile)가 첫 렌더에 확정돼야 폼 중간에 문항이
  // 끼어들며 밀리지 않는다. 신청서 훅과 같은 queryKey라 요청은 한 번만 나가고,
  // detail 과 병렬이라 체감 지연도 없다.
  const { isLoading: isProfileLoading } = useQuery(adopterQueries.profile())

  if (isLoading || isProfileLoading) {
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

  return <ApplicationForm detail={mapAdoptionDetail(data)} />
}

export default AdoptionApplyPage
