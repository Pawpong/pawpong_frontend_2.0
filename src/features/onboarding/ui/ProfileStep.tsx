'use client'

import { useQuery } from '@tanstack/react-query'
import { termsQueries } from '@/entities/term'
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    onSubmit,
    firstErrorMessage,
    goBack,
  } = useStepForm('profile', profileSchema, {
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
  })

  return (
    <StepContainer
      title="계정 정보를 입력해주세요"
      subtitle="문자 인증이 반복해서 실패하면 이메일로 이어갈 수 있어요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      navError={
        firstErrorMessage ??
        (termsUnavailable
          ? '약관 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
          : undefined)
      }
    >
      <PhoneVerificationSection
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
      />
      <AgreementSection control={control} setValue={setValue} activeTerms={activeTerms} />
    </StepContainer>
  )
}

export { ProfileStep }
