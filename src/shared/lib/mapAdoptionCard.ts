import type { AdoptionListingCard, AdoptionPetCard } from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'
import { petTypeToCategory } from '@/shared/lib/petCategory'

// AdoptionCard 는 <Image src> 를 무조건 렌더 — 사진 없는 분양글의 빈 URL 크래시 방어
const FALLBACK_THUMBNAIL = '/images/mock-pet.jpg'

/** v2 입양 목록/인기 API 카드(AdoptionPetCard) → 탐색 그리드 뷰모델(AdoptionListingCard) */
export const mapAdoptionCard = (c: AdoptionPetCard): AdoptionListingCard => ({
  listingId: c.petId,
  name: c.name,
  gender: c.gender,
  birthDateText: formatDate(c.birthDate),
  thumbnailUrl: c.primaryPhotoUrl || c.photoUrls?.[0] || FALLBACK_THUMBNAIL,
  status: c.status,
  category: petTypeToCategory(c.petType),
  inquiryCount: c.inquiryCount,
  favoriteCount: c.favoriteCount,
  viewCount: c.viewCount,
  isFavorited: c.isFavorited,
  isPopular: c.isPopular,
  postedAt: formatDate(c.createdAt),
})
