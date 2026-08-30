import type { AdoptionGridCardListing } from '@/entities/adoption'
import type { MyPetPostingCard } from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'

/** 내 분양글 API 카드를 즐겨찾기 없는 공용 분양 카드 형태로 변환한다. */
export const mapMyPetPostingCard = (posting: MyPetPostingCard): AdoptionGridCardListing => ({
  listingId: posting.petId,
  name: posting.name,
  gender: posting.gender,
  birthDateText: formatDate(posting.birthDate),
  thumbnailUrl: posting.primaryPhotoUrl,
  status: posting.status,
})
