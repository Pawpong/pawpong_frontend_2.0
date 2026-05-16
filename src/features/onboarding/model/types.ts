export type UserType = 'general' | 'breeder'

export interface StepConfig {
  id: string
  label: string
}

export const ONBOARDING_STEPS: Record<UserType, StepConfig[]> = {
  general: [
    { id: 'profile', label: '계정 정보 입력' },
    { id: 'info', label: '회원 정보 입력' },
    { id: 'survey', label: '간단한 조사 양식' },
    { id: 'complete', label: '가입완료' },
  ],
  breeder: [
    { id: 'animal-select', label: '브리딩 동물 선택' },
    { id: 'profile', label: '계정 정보 입력' },
    { id: 'kennel-info', label: '브리더 정보 입력' },
    { id: 'documents', label: '입점 서류 등록' },
    { id: 'complete', label: '가입완료' },
  ],
}
