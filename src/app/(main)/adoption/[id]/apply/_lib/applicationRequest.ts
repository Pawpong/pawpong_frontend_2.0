import type { AdoptionDetailDto, ApplicationCreateRequest } from '@/shared/types'
import type { ApplicationFormValues } from './schema'

// 폼 값 → 입양 신청 생성 요청 DTO 매핑 (폼에서 받지 않는 필드는 빈 문자열)
export const toCreateApplicationRequest = (
  detail: AdoptionDetailDto,
  data: ApplicationFormValues,
): ApplicationCreateRequest => ({
  breederId: detail.breeder.id,
  petId: detail.listingId,
  privacyConsent: data.privacyConsent,
  // selfIntroduction DTO 정의(성별·연령대·거주지·결혼계획·생활패턴)가 조사의 자기소개와 일치 —
  // 조사를 채운 경우 그 값을, 아니면 기존처럼 입양 계획을 사용
  selfIntroduction: data.selfIntroduction?.trim() || data.adoptionPlan,
  familyMembers: data.familyMembers,
  allFamilyConsent: data.allFamilyConsent,
  canProvideBasicCare: data.canProvideBasicCare,
  canAffordMedicalExpenses: data.canAffordMedicalExpenses,
  allergyTestInfo: '',
  timeAwayFromHome: data.timeAwayFromHome ?? '',
  livingSpaceDescription: data.livingSpaceDescription ?? '',
  previousPetExperience: '',
})
