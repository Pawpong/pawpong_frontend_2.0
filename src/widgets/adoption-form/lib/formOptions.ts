import type { DropdownOption } from '@/shared/ui'

export const GENDER_OPTIONS = [
  { value: 'female', label: '암컷' },
  { value: 'male', label: '수컷' },
] satisfies DropdownOption[]

// 값은 서버 enum(completed | incomplete)을 그대로 쓴다 — 라벨만 화면 문구에 맞춘다
export const VACCINATION_OPTIONS = [
  {
    value: 'completed',
    label: '접종 완료',
    description: '접종수첩·병원 안내로 완료 여부를 확인했어요',
  },
  {
    value: 'incomplete',
    label: '진행 중 · 미접종',
    description: '남은 접종이 있거나 아직 시작하지 않았어요',
  },
]

export const GENETIC_TEST_OPTIONS = [
  { value: 'completed', label: '검사 완료', description: '검사명과 결과를 확인할 수 있어요' },
  {
    value: 'incomplete',
    label: '예정 · 미검사',
    description: '검사 전이거나 결과를 기다리고 있어요',
  },
]

export const RELATIONSHIP_OPTIONS = [
  { value: 'mother', label: '엄마' },
  { value: 'father', label: '아빠' },
] satisfies DropdownOption[]
