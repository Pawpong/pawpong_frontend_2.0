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

/** 등록 요청: 부모 동물 */
export interface ParentPetAddRequest extends PetBase {
  photoFileName: string
}

/** 등록 요청: 분양 동물 */
export interface AvailablePetAddRequest extends PetBase {
  price: number
  parentInfo?: {
    mother?: string
    father?: string
  }
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

// ==================== 브리더 후기 (브리더 수신) ====================

export interface BreederReceivedReviewItemDto {
  reviewId: string
  adopterId: string
  adopterName: string
  petId?: string
  petName?: string
  rating: number
  comment: string
  photos?: string[]
  visibility: 'public' | 'private'
  isReported: boolean
  createdAt: string
  replyContent?: string
  replyWrittenAt?: string
  replyUpdatedAt?: string
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

// ==================== 인증 서류 ====================

export interface VerificationStatusDto extends Omit<BreederVerificationDto, 'plan'> {
  breederId: string
  submittedByEmail?: boolean
}

export interface UploadedDocumentDto extends BreederDocumentDto {
  fileName: string
  size: number
}

export interface UploadDocumentsResponseDto {
  count: number
  level: BreederLevel
  documents: UploadedDocumentDto[]
}

export interface SubmitDocumentsRequest {
  level: BreederLevel
  documents: Array<Pick<BreederDocumentDto, 'type'> & { fileName: string }>
  submittedByEmail?: boolean
}

// ==================== 회원 탈퇴 ====================

export interface BreederAccountDeleteRequest {
  reason?: string
  otherReason?: string
}

export interface BreederAccountDeleteResponse {
  breederId: string
  deletedAt: string
  message: string
}
