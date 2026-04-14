/**
 * 상담 신청 폼 관련 타입 정의
 * 출처: counselform/_types/counsel.ts, modify-counselform/_types/breeder-question.types.ts
 */

/** 상담 신청 폼 데이터 (프론트엔드 폼 상태) */
export interface CounselFormData {
  privacyAgreement: boolean
  name: string
  phone: string
  email: string
  introduction: string
  familyMembers: string
  familyAgreement: boolean
  allergyCheck: string
  awayTime: string
  livingSpace: string
  previousPets: string
  basicCare: boolean
  medicalExpense: boolean
  interestedAnimal: string[]
  interestedAnimalDetails: string
  adoptionTiming: string
  customQuestionResponses?: Record<string, string>
}

/** 브리더 추가 질문 아이템 */
export interface Question {
  id: string
  question: string
}

/** 브리더 추가 질문 섹션 ref 타입 */
export interface BreederAdditionalQuestionSectionRef {
  saveQuestions: () => Promise<void>
  hasChanges: boolean
  hasValidInput: boolean
}

/** 브리더 추가 질문 섹션 props 타입 */
export interface BreederAdditionalQuestionSectionProps {
  onSaveComplete?: () => void
  onStateChange?: (hasChanges: boolean, hasValidInput: boolean) => void
}
