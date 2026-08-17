import type { DropdownOption } from '@/shared/ui'

export const GENDER_OPTIONS = [
  { value: 'female', label: '여자' },
  { value: 'male', label: '남자' },
] satisfies DropdownOption[]

// 값은 서버 enum(completed | incomplete)을 그대로 쓴다 — 라벨만 화면 문구에 맞춘다
export const VACCINATION_OPTIONS = [
  { value: 'completed', label: '접종 완료' },
  { value: 'incomplete', label: '미접종' },
] satisfies DropdownOption[]

export const GENETIC_TEST_OPTIONS = [
  { value: 'completed', label: '검사 완료' },
  { value: 'incomplete', label: '검사 미완료' },
] satisfies DropdownOption[]

export const RELATIONSHIP_OPTIONS = [
  { value: 'mother', label: '엄마' },
  { value: 'father', label: '아빠' },
] satisfies DropdownOption[]

export const DOSE_OPTIONS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}차`,
})) satisfies DropdownOption[]
