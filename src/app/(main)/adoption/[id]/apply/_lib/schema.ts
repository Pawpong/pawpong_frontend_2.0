import { z } from 'zod'

export const applicationSchema = z.object({
  adoptionPlan: z.string().min(1, '입양 계획을 입력해주세요'),
  privacyConsent: z.boolean().refine((v) => v, '개인정보 수집 및 이용에 동의해주세요'),
  canProvideBasicCare: z.boolean().refine((v) => v, '기본 케어 가능 여부를 확인해주세요'),
  canAffordMedicalExpenses: z.boolean().refine((v) => v, '치료비 감당 가능 여부를 확인해주세요'),
  familyMembers: z.string().min(1, '가족 구성원을 입력해주세요'),
  allFamilyConsent: z.boolean().refine((v) => v, '가족 동의 여부를 확인해주세요'),
  // 조사 건너뛴 입양자용 선택 항목 (apply 변형) — 미입력 허용, isValid에 영향 없음
  selfIntroduction: z.string().optional(),
  timeAwayFromHome: z.string().optional(),
  livingSpaceDescription: z.string().optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>

// [refactored] 스키마 파생 타입이라 스키마 옆이 제자리 (_ui/FormFields 에서 이동)
// 문자열 필드 키만 추림 — 필드 추가/삭제 시 자동 반영(drift 방지)
export type ApplicationTextField = {
  [K in keyof ApplicationFormValues]-?: NonNullable<ApplicationFormValues[K]> extends string
    ? K
    : never
}[keyof ApplicationFormValues]

export const getAgeText = (birthDate: string): string => {
  const match = birthDate.match(/(\d{4})년\s*(\d{1,2})월/)
  let birthYear: number
  let birthMonth: number
  if (match) {
    birthYear = parseInt(match[1], 10)
    birthMonth = parseInt(match[2], 10)
  } else {
    // ISO('2025-06-20')·표시용('2025.06.20') 등 파싱 가능한 날짜 폴백 (실 API birthDate 대응)
    const date = new Date(birthDate)
    if (Number.isNaN(date.getTime())) return birthDate
    birthYear = date.getFullYear()
    birthMonth = date.getMonth() + 1
  }
  const now = new Date()
  const monthsDiff = (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth)
  if (monthsDiff < 12) return `${monthsDiff}개월`
  return `${Math.floor(monthsDiff / 12)}살`
}
