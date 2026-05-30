'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type SurveyFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { TextareaField } from '@/shared/ui'
import { CheckboxField } from './CheckboxField'

const SurveyStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, watch, handleSubmit, onSubmit } =
    useStepForm<SurveyFormData>('survey', {
      privacyAgreed: false as unknown as true,
      name: '',
      phone: '',
      email: '',
      selfIntro: '',
      awayTime: '',
      livingSpace: '',
    })

  return (
    <StepContainer
      title="간단한 조사 양식"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
    >
      {/* 콘텐츠 영역 */}
      <div className="flex w-full flex-col">
        {/* 섹션 1: 개인정보 수집 동의 */}
        <div className="flex flex-col gap-[0.4375rem]">
          <div className="flex items-center gap-1">
            <p className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
              반려동물 입양 상담을 위한 개인정보 수집과 이용에 동의하시나요?
            </p>
            <span className="shrink-0 p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
              필수
            </span>
          </div>

          <ul className="list-disc pl-[1.125rem] text-[0.75rem] leading-[1.5] font-semibold text-[#5d5d5d] tab:pl-[1.5rem] tab:text-[1rem]">
            <li>수집하는 개인정보 항목 : 이름, 연락처, 이메일주소 등</li>
            <li>수집 및 이용 목적 : 입양자 상담 및 검토</li>
            <li>보유 및 이용기간 : 상담 또는 입양 직후 폐기</li>
          </ul>

          <Controller
            name="privacyAgreed"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="동의합니다"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                className="rounded-[1rem] bg-[#f3f3f3] px-[1.25rem] py-[0.9375rem]"
              />
            )}
          />
        </div>



        {/* 섹션 3: 자기소개 */}
        <div className="mt-[2.0625rem] flex flex-col gap-[0.125rem] tab:mt-[3.625rem]">
          <button
            type="button"
            className="mb-3 flex items-center gap-0 self-end rounded-lg bg-[#3e3e3e] px-2 py-1 text-[0.875rem] font-semibold text-[#f6f6f6]"
          >
            다음에 작성하기
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="size-6">
              <path d="M9.7 18.3L15.3 12.7C15.4 12.6 15.475 12.4917 15.525 12.375C15.575 12.2583 15.6 12.1333 15.6 12C15.6 11.8667 15.575 11.7417 15.525 11.625C15.475 11.5083 15.4 11.4 15.3 11.3L9.7 5.7C9.38333 5.38333 9.31267 5.021 9.488 4.613C9.66267 4.20433 9.97467 4 10.424 4C10.8733 4 11.2 4.2 11.4 4.6L17.025 10.225C17.225 10.425 17.375 10.65 17.475 10.9C17.575 11.15 17.625 11.4167 17.625 11.7C17.625 11.9833 17.575 12.25 17.475 12.5C17.375 12.75 17.225 12.975 17.025 13.175L11.4 18.8C11.0833 19.1167 10.721 19.1877 10.313 19.013C9.90433 18.8377 9.7 18.5253 9.7 18.076V18.3Z" fill="#f6f6f6" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <p className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
              간단하게 자기소개 부탁드려요
            </p>
            <span className="shrink-0 p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
              필수
            </span>
          </div>

          <TextareaField
            placeholder="성별, 연령대, 거주지, 결혼 계획, 생활패턴 등"
            maxLength={100}
            currentLength={watch('selfIntro')?.length ?? 0}
            {...register('selfIntro')}
          />
        </div>

        {/* 섹션 4: 공간/생활패턴 */}
        <div className="mt-[2.0375rem] tab:mt-[3.662rem]">
          <div className="flex items-center gap-1">
            <p className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
              반려동물이 지낼 공간과 생활패턴에 대해 알려주세요
            </p>
            <span className="shrink-0 p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
              선택
            </span>
          </div>

          <div className="mt-[1.25rem] flex flex-col gap-[1.25rem] tab:mt-3 tab:gap-3">
            <div className="flex flex-col gap-[0.125rem]">
              <div className="flex items-center gap-1">
                <p className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
                  평균적으로 집을 비우는 시간은 얼마나 되나요?
                </p>
                <span className="shrink-0 p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
                  선택
                </span>
              </div>
              <TextareaField
                placeholder="출퇴근 / 외출 시간을 포함해 하루 중 집을 비우는 시간"
                maxLength={100}
                currentLength={watch('awayTime')?.length ?? 0}
                {...register('awayTime')}
              />
            </div>

            <div className="flex flex-col gap-[0.125rem]">
              <div className="flex items-center gap-1">
                <p className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
                  반려동물과 함께 지내게 될 공간을 소개해 주세요
                </p>
                <span className="shrink-0 p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
                  선택
                </span>
              </div>
              <TextareaField
                placeholder="반려동물이 주로 생활할 공간(예: 거실 등)과 환경(크기, 구조 등)"
                maxLength={100}
                currentLength={watch('livingSpace')?.length ?? 0}
                {...register('livingSpace')}
              />
            </div>
          </div>
        </div>
      </div>

    </StepContainer>
  )
}

export { SurveyStep }
