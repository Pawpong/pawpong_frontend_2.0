'use client'

import { useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
import { AttachmentIcon } from '@/shared/assets/icons'
import { Checkbox, DetailLink } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'
import { type DocumentsFormData } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepNavButtons } from './StepNavButtons'

const DocumentsStep = () => {
  const { goNext, goBack, formData, setFormData } = useOnboarding()

  const { control, handleSubmit } = useForm<DocumentsFormData>({
    // resolver: zodResolver(documentsSchema),
    defaultValues: (formData.documents as DocumentsFormData) ?? {
      idDocument: undefined,
      registrationCert: undefined,
      breederAgreed: false as unknown as true,
    },
  })

  const onSubmit = (data: DocumentsFormData) => {
    setFormData('documents', data as unknown as Record<string, unknown>)
    goNext()
  }

  return (
    <StepLayout>
      <StepTitle>브리더 정보를 입력해주세요</StepTitle>

      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

      {/* 서류 영역 */}
      <div className="mt-[4rem] flex w-full flex-col px-[1.25rem] tab:mt-[6rem] tab:w-[53.8125rem] tab:px-0">
        {/* 신분증 사본 */}
        <button
          type="button"
          className="flex h-[3.5625rem] w-full items-center gap-[0.75rem] rounded-[1rem] bg-[#a8a8a8] px-[1.25rem] py-[0.9375rem] tab:h-[4.375rem]"
        >
          <AttachmentIcon className="size-[1.5rem] shrink-0 text-white" />
          <span className="text-[1rem] font-semibold leading-[1.375rem] text-white">
            신분증 사본
          </span>
        </button>

        {/* 안내 문구 */}
        <p className="mt-[0.375rem] text-[0.875rem] font-semibold leading-[1.375rem] text-[#a8a8a8] tab:mt-[0.75rem] tab:px-[2.875rem]">
          이름과 생년월일 이외에  개인정보는 가려서 제출해주시 바랍니다.
        </p>

        {/* 동물생산업 등록증 */}
        <button
          type="button"
          className="mt-[1rem] flex h-[3.625rem] w-full items-center gap-[0.75rem] rounded-[1rem] bg-[#d5d5d5] px-[1.25rem] py-[0.9375rem] tab:mt-[2rem] tab:h-[4.375rem]"
        >
          <AttachmentIcon className="size-[1.5rem] shrink-0 text-white" />
          <span className="text-[1rem] font-semibold leading-[1.375rem] text-white">
            동물생산업 등록증
          </span>
        </button>

        {/* 서약서 체크 */}
        <Controller
          name="breederAgreed"
          control={control}
          render={({ field }) => (
            <label className="mt-[1rem] flex cursor-pointer items-center gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem] tab:mt-[4rem]">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                className="size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]"
              />
              <span className="flex-1 text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1rem]">
                (필수) 브리더 입점 서약서
              </span>
              <DetailLink variant="button" size="md" onClick={(e) => e.preventDefault()} className="tab:text-[1rem]" />
            </label>
          )}
        />
      </div>

      <StepNavButtons onNext={() => handleSubmit(onSubmit)()} onBack={goBack} className="tab:mt-[9.9375rem]" />
    </StepLayout>
  )
}

export { DocumentsStep }
