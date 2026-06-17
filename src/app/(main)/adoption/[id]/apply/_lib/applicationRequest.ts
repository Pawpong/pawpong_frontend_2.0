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
  selfIntroduction: data.adoptionPlan,
  familyMembers: data.familyMembers,
  allFamilyConsent: data.allFamilyConsent,
  canProvideBasicCare: data.canProvideBasicCare,
  canAffordMedicalExpenses: data.canAffordMedicalExpenses,
  allergyTestInfo: '',
  timeAwayFromHome: '',
  livingSpaceDescription: '',
  previousPetExperience: '',
})
