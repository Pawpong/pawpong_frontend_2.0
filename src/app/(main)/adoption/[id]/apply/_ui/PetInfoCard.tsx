import type { AdoptionDetailDto } from '@/shared/types'
import { AdoptionSummaryCard } from '@/entities/adoption'

// [refactored] 조립은 AdoptionSummaryCard 가 맡고 여기서는 상세 응답의 필드만 옮긴다
const PetInfoCard = ({ detail }: { detail: AdoptionDetailDto }) => (
  <AdoptionSummaryCard
    listingId={detail.listingId}
    name={detail.name}
    gender={detail.gender}
    birthText={detail.birthDate}
    imageUrl={detail.imageUrls[0]}
    description={detail.description}
    status={detail.status}
    isPopular={detail.isPopular}
  />
)

export { PetInfoCard }
