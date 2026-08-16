'use client'

import { useQuery } from '@tanstack/react-query'
import { termsQueries } from '@/entities/terms'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { profileSchema } from '../model/schema'
import { hasAllRequiredAdopterTerms } from '../model/termsAgreements'
import { StepContainer } from './StepContainer'
import { PhoneVerificationSection } from './PhoneVerificationSection'
import { AgreementSection } from './AgreementSection'

const ProfileStep = () => {
  const { userType } = useOnboarding()
  const { data: activeTerms, isError: isTermsError } = useQuery(termsQueries.list())
  const termsUnavailable =
    userType === 'general' &&
    (isTermsError || (activeTerms !== undefined && !hasAllRequiredAdopterTerms(activeTerms)))

  const { register, control, handleSubmit, setValue, onSubmit, firstErrorMessage, goBack } =
    useStepForm('profile', profileSchema, {
      email: '',
      phone: '',
      verificationCode: '',
      phoneVerified: false,
      serviceAgreed: false,
      privacyAgreed: false,
      marketingAgreed: false,
      isOver14: false,
    })

  return (
    <StepContainer
      title="계정 정보를 입력해주세요"
      subtitle="문자 미수신 시 [인증번호 재전송] 버튼을 눌러주세요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      navError={
        firstErrorMessage ??
        (termsUnavailable
          ? '약관 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
          : undefined)
      }
    >
      <PhoneVerificationSection control={control} register={register} setValue={setValue} />
      <AgreementSection control={control} setValue={setValue} activeTerms={activeTerms} />
    </StepContainer>
  )
}

export { ProfileStep }
