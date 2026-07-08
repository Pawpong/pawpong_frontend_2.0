import type { Breeder } from '@/shared/types'
import type { ExploreBreeder } from '@/shared/mocks/breederExplore'
import { formatDate } from '@/shared/lib/formatDate'

/**
 * v2 브리더 탐색/인기 API 카드(Breeder) → 탐색 그리드 뷰모델(ExploreBreeder).
 * badges/inquiryCount/viewCount 는 BreederCard 가 렌더하지 않는 타입 충족용 필드.
 */
export const mapBreederCard = (b: Breeder, isPopular = false): ExploreBreeder => ({
  id: b.breederId,
  nickname: b.breederName,
  imageUrl: b.profileImage || b.representativePhotos?.[0] || null,
  badges: [],
  isBreeding: b.isAdoptionAvailable,
  location: b.location,
  date: formatDate(b.createdAt),
  isPopular,
  inquiryCount: 0,
  favoriteCount: b.favoriteCount,
  viewCount: 0,
})
