import type { AdoptionGridCardListing } from '@/entities/adoption'
import type { MyPetPostingCard } from '@/shared/types'

/** 내 분양글 응답 -> 공용 카드가 그리는 모양 (필드명만 다르고 의미는 같다) */
export const toGridCardListing = (posting: MyPetPostingCard): AdoptionGridCardListing => ({
  listingId: posting.petId,
  name: posting.name,
  gender: posting.gender,
  ageText: posting.ageDescription,
  thumbnailUrl: posting.primaryPhotoUrl,
  status: posting.status,
})
