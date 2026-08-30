/**
 * 입양 탐색 페이지 관련 타입 정의
 */

import type { PetGender, PetStatus } from './BreederTypes'
import type { CommunityPetType } from './CommunityTypes'
import type {
  VaccinationStatusType,
  GeneticTestStatusType,
  PetVaccinationRecord,
  PetGeneticTestRecord,
  ParentRelation,
} from './PetPostingTypes'

/** 동물 카테고리 필터 */
export type AnimalCategory = 'all' | 'dog' | 'cat' | 'lizard'

/** 유효한 카테고리 목록 */
export const ANIMAL_CATEGORIES: AnimalCategory[] = ['all', 'cat', 'dog', 'lizard']

/** 카테고리 한글 라벨 매핑 */
export const CATEGORY_LABEL: Record<AnimalCategory, string> = {
  all: '전체',
  dog: '강아지',
  cat: '고양이',
  lizard: '도마뱀',
}

/** 입양 게시글 카드 */
export interface AdoptionListingCard {
  listingId: string
  name: string
  gender: 'male' | 'female'
  /** 표시용 생년월일 (YYYY년 MM월 DD일생) — 나이 대신 태어난 날을 보여준다 */
  birthDateText: string
  thumbnailUrl: string
  status: PetStatus
  category: AnimalCategory
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  isFavorited: boolean
  isPopular: boolean
  postedAt: string
  description?: string
  chatCount?: number
}

/** 내가 입양한 목록 아이템 */
export interface AdoptedListingCard extends AdoptionListingCard {
  adoptedAt: string
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
  /** 미완료 시 브리더가 입력한 사유 */
  vaccinationIncompleteReason?: string
  geneticTestCompleted: boolean
  geneticTest: GeneticTestInfo
  geneticTestIncompleteReason?: string
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
  status: PetStatus
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
  chatCount: number
  isFavorited: boolean
  isPopular: boolean
  breeder: BreederSummary
  health: HealthInfo
  parents: ParentInfo[]
  breedingEnvironment: BreedingEnvironment
  otherListings: AdoptionListingCard[]
}

// ==================== v2 입양 API 타입 (인증) ====================

/** v2 관심 등록/해제 응답 */
export interface AdoptionFavoriteResponse {
  petId: string
  favoriteCount: number
  success: boolean
}

/** v2 내가 입양한 동물 카드 (adoptedAt 추가) */
export interface AdoptedPetCard extends AdoptionPetCard {
  adoptedAt: string
}

/** v2 관심 목록 파라미터 */
export interface AdoptionFavoritesParams {
  status?: PetStatus
  page?: number
  pageSize?: number
}

/** v2 입양 완료 목록 파라미터 */
export interface AdoptionAdoptedParams {
  page?: number
  pageSize?: number
}

// ==================== v2 입양 신청 ====================

/** v2 입양 신청서 제출 요청 */
export interface CreateAdoptionApplicationRequest {
  petId: string
  adoptionPlan: string
  familyMembers: string
  privacyConsent: boolean
  basicCareConsent: boolean
  emergencyCareConsent: boolean
  allFamilyConsent: boolean
}

/** v2 입양 신청서 제출 응답 */
export interface CreateAdoptionApplicationResponse {
  applicationId: string
  status: string
}

// ==================== v2 입양 API 타입 ====================

/** v2 정렬 기준 */
export type AdoptionSortType = 'latest' | 'popular'

/** v2 입양 동물 카드 */
export interface AdoptionPetCard {
  petId: string
  breederId: string
  breederName: string
  name: string
  breed: string
  petType: CommunityPetType
  gender: PetGender
  birthDate: string
  price: number
  status: PetStatus
  primaryPhotoUrl: string
  photoUrls: string[]
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  isFavorited: boolean
  isPopular: boolean
  createdAt: string
}

/** v2 입양 동물 목록 파라미터 */
export interface AdoptionListParams {
  petType?: CommunityPetType
  breederId?: string
  excludePetId?: string
  status?: PetStatus
  keyword?: string
  sort?: AdoptionSortType
  page?: number
  pageSize?: number
}

/** v2 인기 입양 동물 파라미터 */
export interface AdoptionPopularParams {
  petType?: CommunityPetType
  limit?: number
}

/** v2 입양 상세 - 부모 정보 */
export interface AdoptionParent {
  relation: ParentRelation
  breed: string
  name: string
  birthDate: string
  photoUrl: string
}

/** v2 입양 상세 - 사육 환경 */
export interface AdoptionBreedingEnv {
  description: string
  photoUrl: string
}

/** v2 입양 상세 - 브리더 요약 */
export interface AdoptionBreederSummary {
  breederId: string
  displayName: string
  profileImageUrl: string
  locationText: string
  bpm: number
}

/** v2 입양 동물 상세 */
export interface AdoptionPetDetail extends AdoptionPetCard {
  description: string
  tags: string[]
  birthDate: string
  vaccinationStatus: VaccinationStatusType
  vaccinationRecords: PetVaccinationRecord[]
  vaccinationIncompleteReason?: string
  geneticTestStatus: GeneticTestStatusType
  geneticTestRecords: PetGeneticTestRecord[]
  geneticTestIncompleteReason?: string
  parents: AdoptionParent[]
  breedingEnvironment?: AdoptionBreedingEnv
  breeder: AdoptionBreederSummary
}
