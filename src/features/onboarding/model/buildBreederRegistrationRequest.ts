import type { SocialSignupSession } from '@/features/auth'
import type { RegisterBreederRequest, UploadBreederDocumentsResponse } from '@/shared/types'
import type { AnimalSelectFormData, KennelInfoFormData, ProfileFormData } from './schema'

const PET_TYPE_MAP = {
  cat: 'cat',
  dog: 'dog',
  lizard: 'reptile',
} as const satisfies Record<AnimalSelectFormData['selected'], RegisterBreederRequest['animal']>

export const DEFAULT_BREEDER_PLAN = 'basic' as const
export const DEFAULT_BREEDER_LEVEL = 'new' as const

interface BuildBreederRegistrationRequestParams {
  social: SocialSignupSession
  animal: AnimalSelectFormData
  profile: ProfileFormData
  kennel: KennelInfoFormData
  uploaded: UploadBreederDocumentsResponse | null
}

/** 검증된 온보딩 상태와 업로드 결과를 브리더 가입 DTO로 옮기는 순수 매퍼. */
export const buildBreederRegistrationRequest = ({
  social,
  animal,
  profile,
  kennel,
  uploaded,
}: BuildBreederRegistrationRequestParams): RegisterBreederRequest => ({
  tempId: social.tempId,
  provider: social.provider,
  email: social.email || profile.email,
  phoneNumber: profile.phone,
  breederName: kennel.breederName,
  breederLocation: { city: kennel.region },
  animal: PET_TYPE_MAP[animal.selected],
  breeds: kennel.selectedBreeds,
  plan: DEFAULT_BREEDER_PLAN,
  level: DEFAULT_BREEDER_LEVEL,
  agreements: {
    termsOfService: profile.serviceAgreed,
    privacyPolicy: profile.privacyAgreed,
    marketingConsent: profile.marketingAgreed,
  },
  profileImage: kennel.profileImage?.filename,
  documentUrls: uploaded?.uploadedDocuments.map(({ filename }) => filename),
  documentTypes: uploaded?.uploadedDocuments.map(({ type }) => type),
})
