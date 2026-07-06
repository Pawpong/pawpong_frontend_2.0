'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { AdoptionDetailContent } from './_ui/AdoptionDetailContent'
import { mapAdoptionDetail } from './_lib/mapAdoptionDetail'

const AdoptionDetailPage = () => {
  const params = useParams<{ id: string }>()
  const petId = params.id

  const { data, isLoading, isError } = useQuery(adoptionQueries.detail(petId))

  if (isLoading) {
    return (
      <Container className="flex min-h-screen items-center justify-center py-10">
        <p className="text-sm text-[#6b6b6b]">불러오는 중...</p>
      </Container>
    )
  }

  if (isError || !data) {
    return (
      <Container className="flex min-h-screen items-center justify-center py-10">
        <p className="text-sm text-[#6b6b6b]">분양글을 불러오지 못했습니다.</p>
      </Container>
    )
  }

  return <AdoptionDetailContent detail={mapAdoptionDetail(data)} />
}

export default AdoptionDetailPage
