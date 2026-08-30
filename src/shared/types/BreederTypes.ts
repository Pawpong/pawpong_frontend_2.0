/**
 * 브리더 관련 타입 정의
 * 출처: breeder.ts, breeder-management.ts (중복 통합)
 */

// ==================== 공통 리터럴 타입 ====================

export type AuthProvider = 'local' | 'google' | 'kakao' | 'naver' | 'apple'

export type BreederVerificationStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'not_submitted'

export type BreederLevel = 'new' | 'elite'

export type PetGender = 'male' | 'female'

export type PetStatus = 'available' | 'reserved' | 'adopted'

// ==================== 공통 서브타입 ====================

export interface BreederLocationDto {
  cityName: string
  districtName: string
  detailAddress?: string
}

export interface BreederPriceRangeDto {
  minPrice: number
  maxPrice: number
  display?: string
}

export interface BreederDocumentDto {
  type: string
  url: string
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

export interface BreederVerificationDto {
  status: BreederVerificationStatus
  plan?: string
  level?: BreederLevel
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
  documents?: BreederDocumentDto[]
}

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

/** 등록/수정 요청: 분양 동물 (POST/PATCH /breeder-management/available-pets) */
export interface AvailablePetAddRequest extends PetBase {
  price: number
  parentInfo?: {
    mother?: string
    father?: string
  }
  photos?: string[]
}

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
  followingCount?: number
  level: BreederLevel
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
  breederLevel: BreederLevel
  petType: string
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
  petType?: 'dog' | 'cat'
  /** 검색어 — 브리더명/품종/지역 부분 일치 */
  keyword?: string
  dogSize?: string[]
  catFurLength?: string[]
  breeds?: string[]
  province?: string[]
  city?: string[]
  isAdoptionAvailable?: boolean
  breederLevel?: string[]
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

// ==================== 내 개체 목록 (breeder-management) ====================

/** 내 개체 목록 아이템 (GET /breeder-management/my-pets) */
export interface BreederMyPetItem {
  petId: string
  name: string
  breed: string
  gender: PetGender
  birthDate: string
  ageInMonths: number
  price: number
  status: PetStatus
  isActive: boolean
  mainPhoto: string
  photoCount: number
  viewCount: number
  applicationCount: number
  createdAt: string
  updatedAt: string
}

/** 내 개체 목록 조회 파라미터 */
export interface MyPetsParams {
  status?: PetStatus
  includeInactive?: boolean
  page?: number
  limit?: number
}

// ==================== 개체 등록/수정/상태 응답 ====================

export interface PetAddResponse {
  petId: string
  message: string
}

export interface PetMessageResponse {
  message: string
}

/** 개체 상태 변경 요청 (PATCH available-pets/{petId}/status) */
export interface PetStatusUpdateRequest {
  petStatus: PetStatus
}

// ==================== 브리더 후기 (브리더 수신) ====================

/** 내게 달린 후기 목록 아이템 (GET /breeder-management/my-reviews) */
export interface BreederMyReviewItem {
  reviewId: string
  breederNickname: string
  breederProfileImage: string
  breederLevel: string
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

// ==================== 인증 ====================

/** 브리더 인증 상태 조회 응답 (GET /breeder-management/verification) */
export interface VerificationStatusResponse {
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  plan?: 'basic' | 'premium' | 'enterprise'
  level?: 'new' | 'intermediate' | 'advanced' | 'expert'
  submittedAt?: string
  reviewedAt?: string
  documents?: BreederDocumentDto[]
  rejectionReason?: string
  submittedByEmail?: boolean
}

/** 브리더 인증 신청 요청 (POST /breeder-management/verification) */
export interface VerificationSubmitRequest {
  businessNumber: string
  businessName: string
  plan: 'basic' | 'premium' | 'enterprise'
  documents: string[]
  businessAddress: string
  experienceYears: string
  specialBreeds: string
  facilityDescription: string
  veterinaryPartnership?: string
  submittedByEmail?: boolean
  additionalMessage?: string
}

export interface VerificationSubmitResponse {
  message: string
}

// ==================== 인증 서류 ====================

export interface UploadedDocumentDto extends BreederDocumentDto {
  fileName: string
  size: number
}

export interface UploadDocumentsResponseDto {
  count: number
  level: BreederLevel
  documents: UploadedDocumentDto[]
}

/** 인증 서류 제출 (간소화) 요청 (POST /breeder-management/verification/submit) */
export interface SubmitDocumentsRequest {
  level: BreederLevel
  documents: Array<{ type: string; fileName: string; originalFileName?: string }>
  submittedByEmail?: boolean
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
