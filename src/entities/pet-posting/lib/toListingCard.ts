import type { AdoptionListingCard, MyPetPostingCard } from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'

// 카드 컴포넌트는 <Image src> 를 무조건 렌더 — 사진 없는 분양글의 빈 URL 크래시 방어
const FALLBACK_THUMBNAIL = '/images/mock-pet.jpg'

/**
 * 내 분양글 API 카드(MyPetPostingCard) → 목록 카드 뷰모델(AdoptionListingCard).
 * 마이홈 분양목록 탭과 /adoption/my-listings 페이지가 공유한다.
 * - category: MyPetPostingCard 에 petType 미포함 — 상태 필터만 쓰는 화면이라 'all' 고정
 * - postedAt: 예약중 뷰의 날짜 그룹핑 키로 쓰여 표시용 'YYYY.MM.DD' 로 통일
 */
export const toListingCard = (c: MyPetPostingCard): AdoptionListingCard => ({
  listingId: c.petId,
  name: c.name,
  gender: c.gender,
  ageText: c.ageDescription,
  thumbnailUrl: c.primaryPhotoUrl || c.photoUrls?.[0] || FALLBACK_THUMBNAIL,
  status: c.status === 'adopted' ? 'completed' : c.status,
  category: 'all',
  inquiryCount: c.inquiryCount,
  favoriteCount: c.favoriteCount,
  viewCount: c.viewCount,
  isFavorited: false,
  isPopular: false,
  postedAt: formatDate(c.createdAt),
  description: c.description,
})
