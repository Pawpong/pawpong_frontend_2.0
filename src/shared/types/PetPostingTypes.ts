import type { PetGender, PetStatus } from './BreederTypes'
import type { CommunityPetType } from './CommunityTypes'

/** 접종 완료 상태 */
export type VaccinationStatusType = 'completed' | 'incomplete'

/** 유전자검사 완료 상태 */
export type GeneticTestStatusType = 'completed' | 'incomplete'

/** 부모 관계 */
export type ParentRelation = 'mother' | 'father'

// ==================== 분양글 작성 요청 ====================

/** 접종 기록 */
export interface PetVaccinationRecord {
  name: string
  date: string
  round: number
}

/** 유전자검사 기록 */
export interface PetGeneticTestRecord {
  date: string
  institution: string
  testName: string
  result: string
}

/** 부모 동물 스냅샷 */
export interface ParentPetSnapshot {
  relation: ParentRelation
  breed: string
  name: string
  birthDate: string
  photoFileName: string
}

/** 사육 환경 */
export interface PetBreedingEnvironment {
  description: string
  photoFileName: string
}

/** 분양글 작성 요청 */
export interface CreatePetPostingRequest {
  name: string
  breed: string
  gender: PetGender
  birthDate: string
  price: number
  description: string
  photos: string[]
  representativePhotoIndex: number
  petType?: CommunityPetType
  vaccinationStatus: VaccinationStatusType
  vaccinationRecords?: PetVaccinationRecord[]
  vaccinationIncompleteReason?: string
  geneticTestStatus: GeneticTestStatusType
  geneticTestRecords?: PetGeneticTestRecord[]
  geneticTestIncompleteReason?: string
  parentPetSnapshots?: ParentPetSnapshot[]
  breedingEnvironment?: PetBreedingEnvironment
}

/** 분양글 작성/수정 응답 */
export interface PetPostingMutationResponse {
  petId: string
}

// ==================== 분양글 수정 요청 ====================

/** 분양글 수정 요청 (화이트리스트 필드만) */
export interface UpdatePetPostingRequest {
  name?: string
  breed?: string
  gender?: PetGender
  birthDate?: string
  price?: number
  description?: string
  petType?: CommunityPetType
  status?: PetStatus
  photos?: string[]
  representativePhotoIndex?: number
}

// ==================== 분양글 삭제 응답 ====================

/** 분양글 삭제 응답 */
export interface PetPostingDeleteResponse {
  petId: string
  deleted: boolean
}

// ==================== 내 분양글 목록 ====================

/** 내 분양글 카드 */
export interface MyPetPostingCard {
  petId: string
  name: string
  breed: string
  petType: CommunityPetType
  gender: PetGender
  ageDescription: string
  price: number
  status: PetStatus
  primaryPhotoUrl: string
  photoUrls: string[]
  description: string
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  /** 활성 채팅방 수 */
  chatCount: number
  createdAt: string
}

/** 내 분양글 목록 파라미터 */
export interface MyPetPostingListParams {
  status?: PetStatus
  page?: number
  pageSize?: number
}
