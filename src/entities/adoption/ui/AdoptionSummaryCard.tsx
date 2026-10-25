import { PopularBadge, SummaryCard } from '@/shared/ui'
import { GENDER_LABEL, type PetGender, type PetStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

interface AdoptionSummaryCardProps {
  listingId: string
  /** 제목 앞부분 — 품종을 함께 보일 화면은 호출부가 붙여서 넘긴다 */
  name: string
  gender: PetGender
  /** 표시용 생년월일 문구 */
  birthText: string
  imageUrl?: string
  description: string
  status: PetStatus
  isPopular: boolean
}

// [refactored] 신청서·채팅 PetInfoCard 가 똑같이 조립하던 제목·상태·인기 뱃지를 한 곳으로 모은 분양 요약 카드
const AdoptionSummaryCard = ({
  listingId,
  name,
  gender,
  birthText,
  imageUrl,
  description,
  status,
  isPopular,
}: AdoptionSummaryCardProps) => (
  <SummaryCard
    href={`/adoption/${listingId}`}
    imageUrl={imageUrl}
    title={`${name} | ${GENDER_LABEL[gender]} ${birthText}`}
    description={description}
    status={ADOPTION_CARD_STATUS[status].label}
    badge={isPopular && <PopularBadge variant="primaryOutline" size="responsive" />}
  />
)

export { AdoptionSummaryCard }
