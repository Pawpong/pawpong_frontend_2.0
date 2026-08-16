import type { SocialSignupSession } from '@/features/auth'
import type { RegisterAdopterRequest, TermsAgreementItem } from '@/shared/types'
import type { InfoFormData, ProfileFormData, SurveyFormData } from './schema'

interface BuildAdopterRegistrationRequestParams {
  social: SocialSignupSession
  profile: ProfileFormData | undefined
  info: InfoFormData
  survey: SurveyFormData
  termsAgreements: TermsAgreementItem[]
  skipped: boolean
}

/** 검증된 온보딩 상태를 API DTO로 옮기는 순수 매퍼. */
export const buildAdopterRegistrationRequest = ({
  social,
  profile,
  info,
  survey,
  termsAgreements,
  skipped,
}: BuildAdopterRegistrationRequestParams): RegisterAdopterRequest => {
  const nickname = info.nickname.trim()
  const selfIntroduction = survey.selfIntro?.trim()

  return {
    tempId: social.tempId,
    email: social.email || profile?.email || '',
    nickname,
    bio: info.introduction?.trim() || undefined,
    realName: social.name || nickname,
    phone: profile?.phone,
    profileImage: info.profileImage?.filename,
    counselDefaultProfile:
      !skipped && selfIntroduction
        ? {
            selfIntroduction,
            dailyAbsenceHours: survey.awayTime?.trim() || undefined,
            livingSpaceDescription: survey.livingSpace?.trim() || undefined,
            counselPrivacyAgreed: survey.privacyAgreed,
          }
        : undefined,
    termsAgreements,
  }
}
