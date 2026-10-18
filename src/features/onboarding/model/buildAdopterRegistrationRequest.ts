import type { SocialSignupSession } from '@/shared/lib/socialSignupSession'
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
  const emailMethod = profile?.verificationMethod === 'email'

  return {
    tempId: social.tempId,
    email: emailMethod ? profile.email.trim().toLowerCase() : social.email || profile?.email || '',
    verificationMethod: emailMethod ? 'email' : 'phone',
    emailVerificationToken: emailMethod ? profile.emailVerificationToken : undefined,
    nickname,
    bio: info.introduction?.trim() || undefined,
    realName: info.realName?.trim() || social.name || nickname,
    phone: emailMethod ? undefined : profile?.phone,
    profileImage: info.profileImage?.filename,
    // 관심있는 키워드(자유 입력)를 서버의 관심 품종 목록으로 보낸다 — 비었으면 생략
    interestedBreedIds: info.selectedKeywords?.length ? info.selectedKeywords : undefined,
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
