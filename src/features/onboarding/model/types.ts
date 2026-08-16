import type {
  ProfileFormData,
  InfoFormData,
  SurveyFormData,
  AnimalSelectFormData,
  KennelInfoFormData,
  DocumentsFormData,
} from './schema'

export type UserType = 'general' | 'breeder'

/** 스텝 id → 그 스텝이 채우는 폼 데이터. 컨텍스트의 formData 타입 소스 */
export interface OnboardingFormData {
  profile: ProfileFormData
  info: InfoFormData
  survey: SurveyFormData
  'animal-select': AnimalSelectFormData
  'kennel-info': KennelInfoFormData
  documents: DocumentsFormData
}

export type FormStepId = keyof OnboardingFormData
export type StepId = FormStepId | 'complete'

export const USER_TYPE_OPTIONS = [
  { value: 'general', label: '일반' },
  { value: 'breeder', label: '브리더' },
] as const satisfies ReadonlyArray<{ value: UserType; label: string }>

export const VALID_USER_TYPES = USER_TYPE_OPTIONS.map(({ value }) => value)

export const isValidUserType = (type: string): type is UserType =>
  VALID_USER_TYPES.includes(type as UserType)

export interface StepConfig {
  id: StepId
  label: string
}

export const ONBOARDING_STEPS = {
  general: [
    { id: 'profile', label: '계정 정보 입력' },
    { id: 'info', label: '회원 정보 입력' },
    { id: 'survey', label: '간단한 조사 양식' },
    { id: 'complete', label: '가입완료' },
  ],
  breeder: [
    { id: 'animal-select', label: '브리더 동물 선택' },
    { id: 'profile', label: '개인 정보 입력' },
    { id: 'kennel-info', label: '브리더 정보 입력' },
    { id: 'documents', label: '입점 서류 등록' },
    { id: 'complete', label: '가입완료' },
  ],
} satisfies Record<UserType, StepConfig[]>

export const isStepForUser = (type: UserType, step: string): step is StepId =>
  ONBOARDING_STEPS[type].some(({ id }) => id === step)
