'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionDetail } from '../_lib/mapAdoptionDetail'
import { ApplicationForm } from './_ui/ApplicationForm'

const AdoptionApplyPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  // 입양 신청 대상 — GET /adoption/:petId (상세 UI 뷰모델 매퍼 재사용)
  const { data, isLoading, isError } = useQuery(adoptionQueries.detail(petId))

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
        <p className="text-sm text-neutral-700">입양 정보를 불러오지 못했습니다.</p>
      </Container>
    )
  }

  return <ApplicationForm detail={mapAdoptionDetail(data)} />
}

export default AdoptionApplyPage
