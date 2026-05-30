'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type SurveyFormData, EMAIL_DOMAINS } from '../model/schema'
import { StepContainer } from './StepContainer'
import { StepInput, StepTextarea, StepSelect } from './StepInput'
import { CheckboxField } from './CheckboxField'

const SurveyStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, onSubmit } =
    useStepForm<SurveyFormData>('survey', {
      privacyAgreed: false as unknown as true,
      name: '',
      phone: '',
      email: '',
      emailDomain: EMAIL_DOMAINS[0],
      selfIntro: '',
      awayTime: '',
      livingSpace: '',
    })

  return (
    <StepContainer
      title="간단한 조사 양식"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      layoutClassName="pb-[14rem]"
      navClassName="bg-white tab:mt-[9.03rem] tab:bg-transparent"
      navExtraButtons={
        <button
          type="button"
          className="h-12 w-full rounded-full border border-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] tab:hidden"
        >
          다음에 하기
        </button>
      }
    >
      {/* 콘텐츠 영역 */}
      <div className="mt-[2.4375rem] flex w-full flex-col px-[1.25rem] tab:mt-[3.125rem] tab:w-[59.4375rem] tab:px-0">
        {/* 섹션 1: 개인정보 수집 동의 */}
        <div className="flex flex-col gap-[0.4375rem]">
          <div className="flex items-center gap-[0.625rem] tab:gap-[1.25rem]">
            <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[1.25rem]">
              반려동물 입양 상담을 위한 개인정보 수집과 이용에 동의하시나요?
            </p>
            <span className="shrink-0 text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[0.75rem] tab:text-[1rem] tab:font-semibold">
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

        {/* 섹션 2: 필수 입력 */}
        <div className="mt-[2.6875rem] tab:mt-[3.787rem]">
          <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[1rem] tab:font-semibold">
            필수
          </p>

          <div className="mt-[0.625rem] flex flex-col gap-[0.625rem] tab:mt-[0.518rem] tab:gap-[1.5625rem]">
            <StepInput type="text" placeholder="이름" {...register('name')} />
            <StepInput type="tel" placeholder="휴대폰번호" {...register('phone')} />

            {/* 이메일 + 도메인 */}
            <div className="flex gap-[0.25rem] tab:gap-[1.25rem]">
              <StepInput
                type="text"
                placeholder="이메일"
                {...register('email')}
                className="flex-1 tab:flex-[731]"
              />
              <Controller
                name="emailDomain"
                control={control}
                render={({ field }) => (
                  <StepSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={EMAIL_DOMAINS.map((d) => ({ value: d, label: d }))}
                    className="shrink-0 tab:w-[12.5rem]"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* 섹션 3: 자기소개 */}
        <div className="mt-[2.0625rem] tab:mt-[3.7875rem]">
          <div className="flex items-center gap-[0.625rem] tab:gap-[1.25rem]">
            <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[1.25rem]">
              간단하게 자기소개 부탁드려요
            </p>
            <span className="shrink-0 text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[0.75rem] tab:text-[1rem] tab:font-semibold">
              필수
            </span>
          </div>

          <StepTextarea
            placeholder="성별, 연령대, 거주지, 결혼 계획, 생활패턴 등"
            {...register('selfIntro')}
            className="mt-[0.625rem] tab:mt-[0.875rem]"
          />
        </div>

        {/* 섹션 4: 공간/생활패턴 */}
        <div className="mt-[2.0375rem] tab:mt-[3.662rem]">
          <div className="flex items-center gap-[0.625rem] tab:gap-[1.25rem]">
            <p className="text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[1.25rem]">
              반려동물이 지낼 공간과 생활패턴에 대해 알려주세요
            </p>
            <span className="shrink-0 text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d] tab:text-[0.75rem] tab:text-[1rem] tab:font-semibold">
              필수
            </span>
          </div>

          <div className="mt-[1.25rem] flex flex-col gap-[1.25rem] tab:mt-[2.125rem] tab:gap-[2.125rem]">
            <div className="flex flex-col gap-[0.625rem] tab:gap-[0.875rem]">
              <p className="text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d] tab:text-[1rem]">
                평균적으로 집을 비우는 시간은 얼마나 되나요?
              </p>
              <StepTextarea
                placeholder="출퇴근 / 외출 시간을 포함해 하루 중 집을 비우는 시간"
                {...register('awayTime')}
              />
            </div>

            <div className="flex flex-col gap-[0.625rem] tab:gap-[0.875rem]">
              <p className="text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d] tab:text-[1rem]">
                반려동물과 함께 지내게 될 공간을 소개해 주세요
              </p>
              <StepTextarea
                placeholder="반려동물이 주로 생활할 공간(예: 거실 등)과 환경(크기, 구조 등)"
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
