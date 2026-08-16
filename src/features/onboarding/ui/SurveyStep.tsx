'use client'

import { Controller, type UseFormRegister } from 'react-hook-form'
import { useStepForm } from '../model/useStepForm'
import { useAdopterSignup } from '../model/useAdopterSignup'
import { surveySchema, SURVEY_TEXT_MAX_LENGTH, type SurveyFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { TextareaField, TextLabel } from '@/shared/ui'
import { CheckboxField } from './CheckboxField'
import { ADOPTION_SURVEY_QUESTIONS } from '@/shared/config/adoptionSurvey'

// [refactored] 라벨(선택) + TextareaField 블록 판박이(자기소개·집비우는·공간소개) 통합
type SurveyTextField = 'selfIntro' | 'awayTime' | 'livingSpace'

const SURVEY_FIELDS: ReadonlyArray<{
  name: SurveyTextField
  label: string
  placeholder: string
}> = [
  {
    name: 'selfIntro',
    label: ADOPTION_SURVEY_QUESTIONS.selfIntroduction.title,
    placeholder: ADOPTION_SURVEY_QUESTIONS.selfIntroduction.placeholder,
  },
  {
    name: 'awayTime',
    label: ADOPTION_SURVEY_QUESTIONS.timeAwayFromHome.title,
    placeholder: ADOPTION_SURVEY_QUESTIONS.timeAwayFromHome.placeholder,
  },
  {
    name: 'livingSpace',
    label: ADOPTION_SURVEY_QUESTIONS.livingSpaceDescription.title,
    placeholder: ADOPTION_SURVEY_QUESTIONS.livingSpaceDescription.placeholder,
  },
]

interface SurveyTextareaProps {
  name: SurveyTextField
  label: string
  placeholder: string
  register: UseFormRegister<SurveyFormData>
  length: number
}

const SurveyTextarea = ({ name, label, placeholder, register, length }: SurveyTextareaProps) => (
  <div className="flex w-full flex-col gap-0.5">
    <TextLabel size="14" requirement="선택">
      {label}
    </TextLabel>
    <TextareaField
      placeholder={placeholder}
      maxLength={SURVEY_TEXT_MAX_LENGTH}
      currentLength={length}
      {...register(name)}
    />
  </div>
)

const SurveyStep = () => {
  // 입양자 플로우의 마지막 데이터 단계 — 실제 가입 호출은 useAdopterSignup 이 담당한다
  const { submit, isPending, error } = useAdopterSignup()

  const { register, control, watch, setValue, handleSubmit, firstErrorMessage, goBack } =
    useStepForm('survey', surveySchema, {
      privacyAgreed: false,
      selfIntro: '',
      awayTime: '',
      livingSpace: '',
    })

  const handleSkip = () => {
    // 선택 답변의 교차 검증보다 스킵 의도가 우선이므로 폼 값도 먼저 비운다.
    setValue('selfIntro', '')
    setValue('awayTime', '')
    setValue('livingSpace', '')
    void handleSubmit((data) => submit(data, { skipped: true }))()
  }

  return (
    <StepContainer
      title="간단한 조사 양식"
      onNext={() => handleSubmit((data) => submit(data, { skipped: false }))()}
      onBack={goBack}
      nextLabel={isPending ? '가입 중...' : '다음'}
      nextDisabled={isPending}
      navError={firstErrorMessage ?? error ?? undefined}
    >
      {/* 콘텐츠 영역 — 섹션 간 gap: 모바일 32px / tab+ 58px (Figma root gap, mt 대신 gap) */}
      <div className="flex w-full flex-col gap-8 tab:gap-[3.625rem]">
        {/* 섹션 1: 개인정보 수집 동의 — 항목 간 gap 8px (Figma spacing/8) */}
        <div className="flex flex-col gap-2">
          <TextLabel size="16" requirement="필수">
            반려동물 입양 상담을 위한 개인정보 수집과 이용에 동의하시나요?
          </TextLabel>

          {/* 개인정보 안내 — TextLabel(Body/lg/medium)을 ul로 렌더, 불릿 hanging indent */}
          <TextLabel as="ul" size="16" weight="medium" className="list-disc ps-6">
            <li>수집하는 개인정보 항목 : 이름, 연락처, 이메일주소 등</li>
            <li>수집 및 이용 목적 : 입양자 상담 및 검토</li>
            <li>보유 및 이용기간 : 상담 또는 입양 직후 폐기</li>
          </TextLabel>

          <Controller
            name="privacyAgreed"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="동의합니다"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="px-2"
              />
            )}
          />
        </div>

        {/* 섹션 2: 조사 항목 — 버튼·라벨·텍스트에어리어 전부 flat gap 12px (Figma 966:22241) */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isPending}
            className="flex items-center gap-0 self-end rounded-lg bg-neutral-850 px-2 py-1 text-[0.875rem] font-semibold text-neutral-50 disabled:opacity-40"
          >
            다음에 작성하기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="M9.7 18.3L15.3 12.7C15.4 12.6 15.475 12.4917 15.525 12.375C15.575 12.2583 15.6 12.1333 15.6 12C15.6 11.8667 15.575 11.7417 15.525 11.625C15.475 11.5083 15.4 11.4 15.3 11.3L9.7 5.7C9.38333 5.38333 9.31267 5.021 9.488 4.613C9.66267 4.20433 9.97467 4 10.424 4C10.8733 4 11.2 4.2 11.4 4.6L17.025 10.225C17.225 10.425 17.375 10.65 17.475 10.9C17.575 11.15 17.625 11.4167 17.625 11.7C17.625 11.9833 17.575 12.25 17.475 12.5C17.375 12.75 17.225 12.975 17.025 13.175L11.4 18.8C11.0833 19.1167 10.721 19.1877 10.313 19.013C9.90433 18.8377 9.7 18.5253 9.7 18.076V18.3Z"
                fill="#f6f6f6"
              />
            </svg>
          </button>

          <SurveyTextarea
            {...SURVEY_FIELDS[0]}
            register={register}
            length={watch(SURVEY_FIELDS[0].name)?.length ?? 0}
          />

          {/* 공간/생활패턴 섹션 라벨 — 모바일 14 / tab+ 16 (Figma) */}
          <TextLabel size="14" requirement="선택" className="tab:text-base">
            반려동물이 지낼 공간과 생활패턴에 대해 알려주세요
          </TextLabel>

          {SURVEY_FIELDS.slice(1).map((field) => (
            <SurveyTextarea
              key={field.name}
              {...field}
              register={register}
              length={watch(field.name)?.length ?? 0}
            />
          ))}
        </div>
      </div>
    </StepContainer>
  )
}

export { SurveyStep }
