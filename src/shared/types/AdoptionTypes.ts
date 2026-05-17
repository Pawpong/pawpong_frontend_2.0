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

/** 성별 한국어 매핑 */
export const GENDER_LABEL: Record<'male' | 'female', string> = {
  male: '남자',
  female: '여자',
}

/** 카테고리별 탐색 페이지 문구 */
export const CATEGORY_DESCRIPTION: Record<AnimalCategory, string> = {
  all: '입양상담까지 안전하게 이어가세요',
  dog: '귀여운 강아지를 찾으시나요?',
  cat: '귀여운 고양이를 찾으시나요?',
  lizard: '귀여운 도마뱀을 찾으시나요?',
}

/** 예방접종 기록 */
export interface VaccinationRecord {
  name: string
  date: string
  dose: string
}

/** 유전병 검사 결과 항목 */
export interface GeneticTestResult {
  disease: string
  result: string
}

/** 유전병 검사 정보 */
export interface GeneticTestInfo {
  date: string
  institution: string
  results: GeneticTestResult[]
}

/** 건강 정보 */
export interface HealthInfo {
  vaccinationCompleted: boolean
  vaccinations: VaccinationRecord[]
  geneticTestCompleted: boolean
  geneticTest: GeneticTestInfo
}

/** 부모 정보 */
export interface ParentInfo {
  role: '엄마' | '아빠'
  name: string
  imageUrl: string
  birthDate: string
}

/** 사육 환경 */
export interface BreedingEnvironment {
  description: string
  imageUrls: string[]
}

/** 브리더 요약 */
export interface BreederSummary {
  id: string
  nickname: string
  location: string
  bpm: number
  profileImageUrl: string
}

/** 입양 상세 정보 */
export interface AdoptionDetailDto {
  listingId: string
  name: string
  status: AdoptionStatus
  price: string
  birthDate: string
  gender: 'male' | 'female'
  description: string
  tags: string[]
  imageUrls: string[]
  category: AnimalCategory
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  isFavorited: boolean
  isPopular: boolean
  breeder: BreederSummary
  health: HealthInfo
  parents: ParentInfo[]
  breedingEnvironment: BreedingEnvironment
  otherListings: AdoptionListingCard[]
}
