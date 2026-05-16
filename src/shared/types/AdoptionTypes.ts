/**
 * 입양 탐색 페이지 관련 타입 정의
 */

/** 동물 카테고리 필터 */
export type AnimalCategory = '전체' | '강아지' | '고양이' | '도마뱀'

/** 입양 상태 */
export type AdoptionStatus = 'available' | 'reserved' | 'completed'

/** 입양 게시글 카드 */
export interface AdoptionListingCard {
  listingId: string
  name: string
  gender: 'male' | 'female'
  ageText: string
  thumbnailUrl: string
  status: AdoptionStatus
  category: AnimalCategory
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  isFavorited: boolean
  isPopular: boolean
  postedAt: string
}

/** 입양 상태 한국어 매핑 */
export const ADOPTION_STATUS_LABEL: Record<AdoptionStatus, string> = {
  available: '입양 가능',
  reserved: '예약중',
  completed: '분양 완료',
}
