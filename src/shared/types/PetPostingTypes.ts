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
  photoFileName?: string
}

/** 사육 환경 */
export interface PetBreedingEnvironment {
  description?: string
  photoFileName?: string
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
  /** 임시저장에서 이어 쓴 경우 그 초안 ID — 발행되면 서버가 초안을 정리한다 */
  draftId?: string
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

// ==================== 분양글 임시저장 ====================

/**
 * 분양글 임시저장 요청.
 *
 * 작성 도중 아무 때나 저장할 수 있어야 하므로 모든 필드가 선택이다.
 * (서버도 필수 필드를 두지 않는다 — 발행 시점에만 검증한다)
 */
export type SavePetPostingDraftRequest = Partial<CreatePetPostingRequest>

/** 임시저장 응답 */
export interface PetPostingDraftSaveResponse {
  draftId: string
}

/** 임시저장 목록 카드 */
export interface PetPostingDraftCard {
  draftId: string
  name: string
  breed: string
  primaryPhotoUrl: string
  updatedAt: string
}

/**
 * 임시저장 사진의 표시용 URL.
 *
 * form 에는 파일키만 있고 클라이언트는 키를 URL 로 바꿀 수 없다.
 * 재저장·발행 시에는 form 의 키를 그대로 돌려보내야 하므로 둘을 나란히 받는다.
 */
export interface PetPostingDraftPhotoUrls {
  /** form.photos 와 같은 순서 */
  pet: string[]
  /** form.parentPetSnapshots 와 같은 순서. 사진 없는 행은 null */
  parents: (string | null)[]
  breedingEnvironment: string | null
}

/** 임시저장 단건 (작성 폼 복원용) */
export interface PetPostingDraftDetail {
  draftId: string
  form: SavePetPostingDraftRequest
  photoUrls: PetPostingDraftPhotoUrls
  updatedAt: string
}

/** 임시저장 삭제 응답 */
export interface PetPostingDraftDeleteResponse {
  draftId: string
  deleted: boolean
}
