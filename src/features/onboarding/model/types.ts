export type UserType = 'general' | 'breeder'

// [refactored] 중복 제거: 3개 파일에서 반복되던 VALID_TYPES + 타입 가드를 여기서 export
export const VALID_USER_TYPES: UserType[] = ['general', 'breeder']

export const isValidUserType = (type: string): type is UserType =>
  VALID_USER_TYPES.includes(type as UserType)

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
