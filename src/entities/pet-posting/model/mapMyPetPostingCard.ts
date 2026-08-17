import type { AdoptionGridCardListing } from '@/entities/adoption'
import type { MyPetPostingCard } from '@/shared/types'

/** 내 분양글 응답을 관심 액션 없는 공용 그리드 카드 형태로 변환한다. */
export const mapMyPetPostingCard = (posting: MyPetPostingCard): AdoptionGridCardListing => ({
  listingId: posting.petId,
  name: posting.name,
  gender: posting.gender,
  ageText: posting.ageDescription,
  thumbnailUrl: posting.primaryPhotoUrl,
  status: posting.status,
})
