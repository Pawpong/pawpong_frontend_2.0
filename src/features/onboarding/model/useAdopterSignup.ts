'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { termsQueries } from '@/entities/term'
import { useRegisterAdopter } from '../api/onboarding.mutations'
import { useOnboarding } from './OnboardingContext'
import { buildTermsAgreements, REQUIRED_ADOPTER_TERM_CODES } from './termsAgreements'
import { buildAdopterRegistrationRequest } from './buildAdopterRegistrationRequest'
import { useSignupCompletion } from './useSignupCompletion' // [refactored]
import { SIGNUP_ERROR } from './signupErrors' // [refactored]
import type { SurveyFormData } from './schema'

/**
 * 입양자 가입 완료 (POST /auth/register/adopter)
 *
 * 조사 양식이 입양자 플로우의 마지막 데이터 단계라, 앞 단계들(profile·info)에서 모은 값과
 * 소셜 세션을 합쳐 가입 DTO 를 만든다. 성공 시에만 다음(가입완료) 단계로 넘어간다.
 */
export const useAdopterSignup = () => {
  const { formData, setFormData } = useOnboarding()
  // 동의 이력에 실을 code/version 출처 (약관은 거의 안 바뀌어 STALE_TIME.VERY_LONG)
  const { data: activeTerms } = useQuery(termsQueries.list())
  const { mutateAsync: registerAdopter, isPending } = useRegisterAdopter()
  const [error, setError] = useState<string | null>(null)
  // [refactored] 세션 확인 + 가입 마무리는 브리더 플로우와 동일 — 공통 훅으로
  const { requireSocialSession, complete } = useSignupCompletion(setError)

  const submit = async (surveyData: SurveyFormData, options: { skipped?: boolean } = {}) => {
    if (isPending) return
    setFormData('survey', surveyData)
    setError(null)

    const social = requireSocialSession()
    if (!social) return

    const profile = formData.profile
    const info = formData.info
    // 폼의 이메일은 소셜 세션 값을 그대로 채운 것 — 세션이 우선, 없으면 폼 값
    const email = social.email || profile?.email || ''

    // 서버 필수값 사전 검증 — 단계를 건너뛰고 URL 로 직접 들어온 경우 원문 400 대신 안내를 띄운다
    const nickname = info?.nickname?.trim()
    if (!info || !nickname) {
      setError('닉네임을 입력해주세요. (회원 정보 입력 단계)')
      return
    }
    if (!email) {
      setError(SIGNUP_ERROR.noEmail)
      return
    }
    if (!profile?.phoneVerified) {
      setError(SIGNUP_ERROR.phoneUnverified)
      return
    }

    const agreedByCode = {
      service: profile?.serviceAgreed,
      privacy: profile?.privacyAgreed,
      marketing: profile?.marketingAgreed,
      age_14plus: profile?.isOver14,
      counsel_privacy: surveyData.privacyAgreed,
    }
    const { agreements: termsAgreements, missingCodes } = buildTermsAgreements(
      activeTerms,
      agreedByCode,
    )
    const missingRequiredConsent = REQUIRED_ADOPTER_TERM_CODES.filter((code) => !agreedByCode[code])

    if (
      missingRequiredConsent.length > 0 ||
      missingCodes.length > 0 ||
      termsAgreements.length === 0
    ) {
      setError('약관 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const skipped = options.skipped || !surveyData.selfIntro?.trim()
    const request = buildAdopterRegistrationRequest({
      social,
      profile,
      info,
      survey: surveyData,
      termsAgreements,
      skipped,
    })

    try {
      const tokens = await registerAdopter(request)
      // 조사 작성 여부는 서버가 counselDefaultProfile 유무로 판별한다 (클라 플래그 불필요)
      await complete(tokens) // [refactored]
    } catch (err) {
      setError(err instanceof Error ? err.message : SIGNUP_ERROR.registerFailed)
    }
  }

  return { submit, isPending, error }
}
