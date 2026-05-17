/**
 * 입양 탐색 페이지 관련 타입 정의
 */

/** 동물 카테고리 필터 */
export type AnimalCategory = 'all' | 'dog' | 'cat' | 'lizard'

/** 카테고리 한글 라벨 매핑 */
export const CATEGORY_LABEL: Record<AnimalCategory, string> = {
  all: '전체',
  dog: '강아지',
  cat: '고양이',
  lizard: '도마뱀',
}

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

/** 카테고리별 탐색 페이지 문구 */
export const CATEGORY_DESCRIPTION: Record<AnimalCategory, string> = {
  all: '입양상담까지 안전하게 이어가세요',
  dog: '귀여운 강아지를 찾으시나요?',
  cat: '귀여운 고양이를 찾으시나요?',
  lizard: '귀여운 도마뱀을 찾으시나요?',
}
