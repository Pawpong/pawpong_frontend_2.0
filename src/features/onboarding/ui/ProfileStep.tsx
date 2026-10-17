'use client'

import { useQuery } from '@tanstack/react-query'
import { termsQueries } from '@/entities/term'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { profileSchema } from '../model/schema'
import {
  hasAllRequiredTerms,
  REQUIRED_ADOPTER_TERM_CODES,
  REQUIRED_BREEDER_TERM_CODES,
} from '../model/termsAgreements'
import { StepContainer } from './StepContainer'
import { PhoneVerificationSection } from './PhoneVerificationSection'
import { AgreementSection } from './AgreementSection'

const ProfileStep = () => {
  const { userType } = useOnboarding()
  const { data: activeTerms, isError: isTermsError } = useQuery(termsQueries.list())
  // 브리더도 약관 코드·버전으로 동의 이력을 남기므로 두 유형 모두 필요한 약관이 있는지 본다
  const requiredTermCodes =
    userType === 'general' ? REQUIRED_ADOPTER_TERM_CODES : REQUIRED_BREEDER_TERM_CODES
  const termsUnavailable =
    isTermsError ||
    (activeTerms !== undefined && !hasAllRequiredTerms(activeTerms, requiredTermCodes))

  const { register, control, handleSubmit, setValue, getValues, onSubmit, goBack } = useStepForm(
    'profile',
    profileSchema,
    {
      email: '',
      phone: '',
      verificationCode: '',
      phoneVerified: false,
      verificationMethod: 'phone',
      phoneFailureCount: 0,
      emailVerificationCode: '',
      emailVerified: false,
      serviceAgreed: false,
      privacyAgreed: false,
      marketingAgreed: false,
      isOver14: false,
    },
  )

  return (
    <StepContainer
      title="연락처를 인증해주세요"
      subtitle="연락받을 정보를 확인하고 서비스 이용약관에 동의해주세요."
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
    >
      <PhoneVerificationSection
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
      />
      <AgreementSection
        control={control}
        setValue={setValue}
        activeTerms={activeTerms}
        termsUnavailable={termsUnavailable}
      />
    </StepContainer>
  )
}

export { ProfileStep }
