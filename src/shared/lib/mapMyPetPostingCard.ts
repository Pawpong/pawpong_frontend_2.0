import type { AdoptionListingCard, MyPetPostingCard } from '@/shared/types'

/**
 * 그리드 카드가 실제로 그리는 필드 (entities/adoption 의 AdoptionGridCardListing 과 같은 Pick).
 * 여기서 entities 를 import 하면 shared -> entities 상향 참조가 되므로 shared/types 에서 파생시킨다.
 */
type GridCardListing = Pick<
  AdoptionListingCard,
  'listingId' | 'name' | 'gender' | 'ageText' | 'thumbnailUrl' | 'status'
>

/** 내 분양글 응답을 관심 액션 없는 공용 그리드 카드 형태로 변환한다. */
export const mapMyPetPostingCard = (posting: MyPetPostingCard): GridCardListing => ({
  listingId: posting.petId,
  name: posting.name,
  gender: posting.gender,
  ageText: posting.ageDescription,
  thumbnailUrl: posting.primaryPhotoUrl,
  status: posting.status,
})
