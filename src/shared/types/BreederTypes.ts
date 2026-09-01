/**
 * 브리더 관련 타입 정의
 * 출처: breeder.ts, breeder-management.ts (중복 통합)
 *
 * 백엔드 응답 그대로인 타입은 손으로 베끼지 말고 ApiSchemas(생성 타입)에서 파생시킨다.
 */
import type { ApiSchemas } from './api'

// ==================== 공통 리터럴 타입 ====================

export type AuthProvider = 'local' | 'google' | 'kakao' | 'naver' | 'apple'

export type BreederVerificationStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'not_submitted'

export type PetGender = 'male' | 'female'

export type PetStatus = 'available' | 'reserved' | 'adopted'

export type BreederPetType = 'dog' | 'cat' | 'reptile'

// ==================== 공통 서브타입 ====================

export interface BreederLocationDto {
  cityName: string
  districtName: string
  detailAddress?: string
}

/** 백엔드 계약 그대로 사용 — 과거 minPrice/maxPrice 로 잘못 베껴 써서 항상 undefined 였다 */
export type BreederPriceRangeDto = ApiSchemas['BreederPriceRangeDto']

export interface BreederDocumentDto {
  type: string
  url: string
  fileName?: string
  originalFileName?: string
  uploadedAt?: string
}

// ==================== 브리더 프로필 ====================

export interface BreederProfileInfoDto {
  profileDescription: string
  locationInfo: BreederLocationDto
  profilePhotos: string[]
  priceRangeInfo: BreederPriceRangeDto
  specializationAreas: string[]
  experienceYears?: number
}

export interface BreederStatsDto {
  totalApplicationCount: number
  completedAdoptionCount: number
  averageRatingScore: number
  totalReviewCount: number
  profileViewCount: number
}

/**
 * 백엔드 계약 그대로 사용 — 실제 응답은 verificationStatus 한 필드뿐인데
 * status/plan/submittedAt/... 로 베껴 놓아 붙이는 순간 전부 undefined 가 되는 상태였다.
 */
export type BreederVerificationDto = ApiSchemas['BreederVerificationDto']

// ==================== 반려동물 ====================

/** 반려동물 공통 베이스 */
interface PetBase {
  name: string
  breed: string
  gender: PetGender
  birthDate: string
  description?: string
}

/** 등록 요청: 부모 동물 (POST /breeder-management/parent-pets) */
export interface ParentPetAddRequest extends PetBase {
  photoFileName?: string
  photos?: string[]
}

/** 수정 요청: 부모 동물 (PATCH) — 전 필드 선택 */
export type ParentPetUpdateRequest = Partial<ParentPetAddRequest>

/** 공개 프로필용 부모 동물 요약 */
export type ParentPetSummaryDto = Pick<
  MyPetItemDto,
  'petId' | 'name' | 'breed' | 'gender' | 'birthDate' | 'photos'
> & { photoFileName?: string }

/** 공개 프로필용 분양 동물 요약 */
export type AvailablePetSummaryDto = Pick<
  MyPetItemDto,
  'petId' | 'name' | 'breed' | 'gender' | 'birthDate' | 'price' | 'status' | 'photos'
>

/** 내 동물 목록 아이템 (브리더 관리) */
export interface MyPetItemDto {
  petId: string
  name: string
  breed: string
  breedKo: string
  birthDate: string
  gender: PetGender
  price: number
  status: PetStatus
  photos: string[]
  applicationCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ==================== 브리더 프로필 응답 ====================

export interface PublicReviewDto {
  reviewId: string
  adopterName: string
  rating: number
  comment: string
  photos?: string[]
  createdAt: string
}

/** 브리더 상세 프로필 응답 (공개/내 프로필 공통) */
export interface BreederProfileResponseDto {
  breederId: string
  breederName: string
  breederEmail: string
  authProvider?: AuthProvider
  marketingAgreed?: boolean
  profileImageFileName?: string
  profileInfo: BreederProfileInfoDto
  parentPetInfo: ParentPetSummaryDto[]
  availablePetInfo: AvailablePetSummaryDto[]
  reviewInfo: PublicReviewDto[]
  statsInfo: BreederStatsDto
  verificationInfo: BreederVerificationDto
}

/** 브리더 공개 프로필 (브리더홈) */
export interface BreederPublicProfile {
  breederId: string
  nickname: string
  profileImageUrl?: string
  bio: string
  longDescription?: string
  bpm: number
  followerCount: number
  /** 이 브리더가 팔로우 중인 수 (즐겨찾기와 별개) */
  followingCount: number
  plan: 'basic' | 'pro'
  businessLocation: {
    city: string
    district: string
    address?: string
  }
  isFavorited: boolean
  /** 로그인 사용자가 이 브리더를 팔로우 중인지 (비로그인/본인 조회는 false) */
  isFollowing: boolean
}

/** 브리더 프로필 수정 요청 — Partial<BreederProfileInfoDto> 기반 */
export type ProfileUpdateRequestDto = Partial<
  Omit<BreederProfileInfoDto, 'specializationAreas'> & {
    specializationTypes: string[]
    breeds: string[]
    marketingAgreed: boolean
    profileImage: string | null
  }
>

/** 브리더 프로필 수정 응답 */
export interface BreederProfileUpdateResponseDto {
  breederId: string
  updatedFields: string[]
  message: string
}

// ==================== 브리더 카드 (탐색/검색) ====================

export interface Breeder {
  breederId: string
  breederName: string
  petType: BreederPetType
  location: string
  mainBreed: string
  specializationTypes?: string[]
  isAdoptionAvailable: boolean
  priceRange?: {
    min: number
    max: number
    display: string
  }
  favoriteCount: number
  isFavorited: boolean
  representativePhotos: string[]
  profileImage?: string
  totalReviews: number
  averageRating: number
  createdAt: string
}

export interface SearchBreederParams {
  petType?: BreederPetType
  /** 검색어 — 브리더명/품종/지역 부분 일치 */
  keyword?: string
  dogSize?: string[]
  catFurLength?: string[]
  breeds?: string[]
  province?: string[]
  city?: string[]
  isAdoptionAvailable?: boolean
  sortBy?: 'latest' | 'favorite' | 'review' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

// ==================== 브리더 대시보드 ====================

export interface DashboardResponseDto {
  breederId: string
  breederName: string
  verificationStatus: string
  stats: {
    totalReviews: number
    averageRating: number
    totalApplications: number
    pendingApplications: number
    totalPets: number
    availablePets: number
  }
  recentApplications: Array<{
    applicationId: string
    adopterName: string
    petName?: string
    status: string
    appliedAt: string
  }>
  recentReviews: Array<{
    reviewId: string
    adopterName: string
    rating: number
    comment: string
    createdAt: string
  }>
}

// ==================== 개체 등록/수정 응답 ====================

export interface PetAddResponse {
  petId: string
  message: string
}

export interface PetMessageResponse {
  message: string
}

// ==================== 브리더 후기 (브리더 수신) ====================

/** 내게 달린 후기 목록 아이템 (GET /breeder-management/my-reviews) */
export interface BreederMyReviewItem {
  reviewId: string
  breederNickname: string
  breederProfileImage: string
  breedingPetType: string
  content: string
  reviewType: string
  writtenAt: string
}

/** 내 후기 목록 조회 파라미터 */
export interface MyReviewsParams {
  visibility?: string
  page?: number
  limit?: number
}

/** 후기 답글 요청 (POST/PATCH reviews/{reviewId}/reply) */
export interface ReviewReplyRequest {
  content: string
}

export interface ReviewReplyResponseDto {
  reviewId: string
  replyContent: string
  replyWrittenAt: string
  replyUpdatedAt?: string
}

export interface ReviewReplyDeleteResponseDto {
  reviewId: string
  message: string
}

// ==================== 입양 신청 폼 (간소화) ====================

/** 간소화 신청 폼 수정 요청 (PATCH /breeder-management/application-form/simple) */
export interface SimpleApplicationFormUpdateRequest {
  questions: Array<{ question: string }>
}

export interface CustomQuestionDto {
  id: string
  type: string
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
  order: number
  isStandard: boolean
}

export interface SimpleApplicationFormUpdateResponse {
  message: string
  customQuestions: CustomQuestionDto[]
  totalQuestions: number
}

// ==================== 회원 탈퇴 ====================

export type BreederAccountDeleteReason =
  | 'no_inquiry'
  | 'time_consuming'
  | 'verification_difficult'
  | 'policy_mismatch'
  | 'uncomfortable_ui'
  | 'other'

export interface BreederAccountDeleteRequest {
  reason: BreederAccountDeleteReason
  otherReason?: string
}

export interface BreederAccountDeleteResponse {
  breederId: string
  deletedAt: string
  message: string
}
