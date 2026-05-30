'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type DocumentsFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { DocumentUploadButton } from './DocumentUploadButton'
import { CheckboxField } from './CheckboxField'

const DocumentsStep = () => {
  const { goBack } = useOnboarding()

  const { control, handleSubmit, onSubmit } =
    useStepForm<DocumentsFormData>('documents', {
      idDocument: undefined,
      registrationCert: undefined,
      breederAgreed: false as unknown as true,
    })

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      navClassName="tab:mt-[9.9375rem]"
    >
      {/* 서류 영역 */}
      <div className="mt-[4rem] flex w-full flex-col px-[1.25rem] tab:mt-[6rem] tab:w-[53.8125rem] tab:px-0">
        <DocumentUploadButton label="신분증 사본" variant="primary" />

        <p className="mt-[0.375rem] text-[0.875rem] leading-[1.375rem] font-semibold text-[#a8a8a8] tab:mt-[0.75rem] tab:px-[2.875rem]">
          이름과 생년월일 이외에 개인정보는 가려서 제출해주시 바랍니다.
        </p>

        <DocumentUploadButton
          label="동물생산업 등록증"
          variant="secondary"
          className="mt-[1rem] tab:mt-[2rem]"
        />

        <Controller
          name="breederAgreed"
          control={control}
          render={({ field }) => (
            <CheckboxField
              label="(필수) 브리더 입점 서약서"
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              hasDetailLink
              className="mt-[1rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem] tab:mt-[4rem]"
            />
          )}
        />
      </div>
    </StepContainer>
  )
}

export { DocumentsStep }
