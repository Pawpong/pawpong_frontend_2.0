import { formatBirthDate } from '@/shared/lib/formatBirthDate'
import type { AdoptionPetDetail } from '@/shared/types'
import { AdoptionSummaryCard } from '@/entities/adoption'
import { cn } from '@/shared/lib/cn'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'

// [refactored] 조립은 AdoptionSummaryCard 가 맡는다 — 채팅은 품종을 이름 앞에 붙인다
// 대화 면 위에 떠 있는 둥근 카드로 — 가로 여백은 대화 목록과 같다
const PetInfoCard = ({ detail }: { detail: AdoptionPetDetail }) => (
  <section className={cn('shrink-0 pt-3', CHAT_GUTTER_X)}>
    <div className={CHAT_CONTENT_WIDTH}>
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
    </div>
  </section>
)

export { PetInfoCard }
