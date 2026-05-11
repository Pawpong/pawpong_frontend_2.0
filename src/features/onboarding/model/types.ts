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
  ],
  breeder: [
    { id: 'profile', label: '계정 정보 입력' },
    { id: 'kennel-info', label: '켄넬 정보' },
    { id: 'documents', label: '서류 제출' },
  ],
}
