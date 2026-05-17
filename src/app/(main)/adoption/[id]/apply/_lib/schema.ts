import { z } from 'zod'

export const applicationSchema = z.object({
  adoptionPlan: z.string().min(1, '입양 계획을 입력해주세요'),
  privacyConsent: z.boolean().refine((v) => v, '개인정보 수집 및 이용에 동의해주세요'),
  canProvideBasicCare: z.boolean().refine((v) => v, '기본 케어 가능 여부를 확인해주세요'),
  canAffordMedicalExpenses: z.boolean().refine((v) => v, '치료비 감당 가능 여부를 확인해주세요'),
  familyMembers: z.string().min(1, '가족 구성원을 입력해주세요'),
  allFamilyConsent: z.boolean().refine((v) => v, '가족 동의 여부를 확인해주세요'),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>

export const getAgeText = (birthDate: string): string => {
  const match = birthDate.match(/(\d{4})년\s*(\d{1,2})월/)
  if (!match) return birthDate
  const birthYear = parseInt(match[1], 10)
  const birthMonth = parseInt(match[2], 10)
  const now = new Date()
  const monthsDiff = (now.getFullYear() - birthYear) * 12 + (now.getMonth() + 1 - birthMonth)
  if (monthsDiff < 12) return `${monthsDiff}개월`
  return `${Math.floor(monthsDiff / 12)}살`
}
