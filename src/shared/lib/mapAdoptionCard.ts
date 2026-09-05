import type { AdoptionListingCard, AdoptionPetCard } from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'
import { formatBirthDate } from '@/shared/lib/formatBirthDate'
import { petTypeToCategory } from '@/shared/lib/petCategory'

/** v2 입양 목록/인기 API 카드(AdoptionPetCard) → 탐색 그리드 뷰모델(AdoptionListingCard) */
export const mapAdoptionCard = (c: AdoptionPetCard): AdoptionListingCard => ({
  listingId: c.petId,
  name: c.name,
  gender: c.gender,
  birthDateText: formatBirthDate(c.birthDate),
  // 사진이 없으면 빈 문자열 그대로 넘긴다 — 카드가 목업 사진 대신 홈과 같은 paw 폴백을 그린다
  thumbnailUrl: c.primaryPhotoUrl || c.photoUrls?.[0] || '',
  status: c.status,
  category: petTypeToCategory(c.petType),
  inquiryCount: c.inquiryCount,
  favoriteCount: c.favoriteCount,
  viewCount: c.viewCount,
  isFavorited: c.isFavorited,
  isPopular: c.isPopular,
  postedAt: formatDate(c.createdAt),
})
