import { formatBirthDate } from '@/shared/lib/formatBirthDate'
import type { AdoptionPetDetail } from '@/shared/types'
import { AdoptionSummaryCard } from '@/entities/adoption'

// [refactored] 조립은 AdoptionSummaryCard 가 맡는다 — 채팅은 품종을 이름 앞에 붙인다
const PetInfoCard = ({ detail }: { detail: AdoptionPetDetail }) => (
  <section className="shrink-0 border-b border-neutral-150">
    <AdoptionSummaryCard
      listingId={detail.petId}
      name={`${detail.breed} ${detail.name}`}
      gender={detail.gender}
      birthText={formatBirthDate(detail.birthDate)}
      imageUrl={detail.primaryPhotoUrl}
      description={detail.description}
      status={detail.status}
      isPopular={detail.isPopular}
    />
  </section>
)

export { PetInfoCard }
