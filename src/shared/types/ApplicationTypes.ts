/**
 * 입양 신청 관련 타입 정의
 * 출처: application.types.ts, application.ts, breeder.ts, breeder-management.ts (중복 통합)
 */

// ==================== 상태 ====================

export type ApplicationStatus =
  | 'consultation_pending'
  | 'consultation_completed'
  | 'adoption_approved'
  | 'adoption_rejected'

/** adopterId 필드가 여러 DTO에서 동일하게 쓰이는 유니온 타입 */
type AdopterIdField = string | { _id: string; nickname?: string } | null

// ==================== 공통 서브타입 ====================

export interface StandardResponses {
  privacyConsent: boolean
  selfIntroduction: string
  familyMembers: string
  allFamilyConsent: boolean
  allergyTestInfo: string
  timeAwayFromHome: string
  livingSpaceDescription: string
  previousPetExperience: string
  canProvideBasicCare: boolean
  canAffordMedicalExpenses: boolean
  preferredPetDescription?: string
  desiredAdoptionTiming?: string
  additionalNotes?: string
  adoptionPlan?: string
}

export interface CustomQuestionResponse {
  questionId: string
  questionLabel: string
  questionType: string
  answer: string | string[]
}

// ==================== 신청 폼 ====================

export interface ApplicationFormQuestion {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select'
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
  order: number
}

/** 신청 폼 공통 베이스 */
interface ApplicationFormBase {
  standardQuestions: ApplicationFormQuestion[]
  customQuestions: ApplicationFormQuestion[]
}

/** 입양자용 신청 폼 조회 응답 */
export interface BreederApplicationFormDto extends ApplicationFormBase {
  totalQuestions: number
}

/** 브리더용 신청 폼 조회 응답 */
export interface ApplicationFormDto extends ApplicationFormBase {
  breederId: string
  breederName: string
}

export interface ApplicationFormUpdateRequest {
  customQuestions: ApplicationFormQuestion[]
}

export interface ApplicationFormSimpleUpdateRequest {
  questions: Array<{ question: string }>
}

export interface ApplicationFormSimpleUpdateResponse {
  message: string
  customQuestions: Array<Pick<ApplicationFormQuestion, 'id' | 'order'> & { question: string }>
  totalQuestions: number
}

// ==================== 신청 생성 ====================

export interface ApplicationCreateRequest extends Omit<
  StandardResponses,
  | 'privacyConsent'
  | 'selfIntroduction'
  | 'familyMembers'
  | 'allFamilyConsent'
  | 'canProvideBasicCare'
  | 'canAffordMedicalExpenses'
> {
  name?: string
  phone?: string
  email?: string
  breederId: string
  petId?: string
  privacyConsent: boolean
  selfIntroduction?: string
  familyMembers: string
  allFamilyConsent: boolean
  canProvideBasicCare: boolean
  canAffordMedicalExpenses: boolean
  customResponses?: Array<Pick<CustomQuestionResponse, 'questionId' | 'answer'>>
}

// ==================== 신청 목록 ====================

export interface ApplicationListItemDto {
  applicationId: string
  reviewId: string | null
  breederId: string
  breederName: string
  profileImage?: string | null
  animalType: 'cat' | 'dog'
  petId?: string
  petName?: string
  petBreed?: string
  status: ApplicationStatus
  applicationDate: string
  appliedAt: string
  processedAt?: string
  customResponses?: CustomQuestionResponse[]
  adopterId?: AdopterIdField
  adopterName?: string
  adopterNickname?: string
}

export interface ReceivedApplicationItemDto {
  applicationId: string
  adopterId: AdopterIdField
  adopterName: string
  adopterNickname: string
  adopterEmail: string
  adopterPhone?: string
  petId?: string
  petName?: string
  preferredPetInfo?: string | null
  standardResponses?: Pick<StandardResponses, 'preferredPetDescription'>
  status: ApplicationStatus
  appliedAt: string
  processedAt?: string
  breederNotes?: string
}

// ==================== 신청 상세 공통 베이스 ====================

interface ApplicationDetailBase {
  applicationId: string
  reviewId: string | null
  petId?: string
  petName?: string
  status: ApplicationStatus
  standardResponses?: StandardResponses
  customResponses: CustomQuestionResponse[]
  appliedAt: string
  processedAt?: string
  breederNotes?: string
}

/** 입양자용 신청 상세 */
export interface ApplicationDetailDto extends ApplicationDetailBase {
  breederId: string
  breederName: string
}

/** 브리더용 신청 상세 */
export interface ReceivedApplicationDetailDto extends ApplicationDetailBase {
  adopterId: AdopterIdField
  adopterName: string
  adopterEmail: string
  adopterPhone?: string
}

// ==================== 상태 변경 ====================

export interface ApplicationStatusUpdateRequest {
  newStatus: ApplicationStatus
  breederNotes?: string
}

export interface ApplicationStatusUpdateResponseDto {
  message: string
}
