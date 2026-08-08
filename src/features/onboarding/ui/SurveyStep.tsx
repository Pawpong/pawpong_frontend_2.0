'use client'

import { useState } from 'react'
import { Controller, type UseFormRegister } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import {
  useCompleteAdopterRegistration,
  loadSocialSignupSession,
  clearSocialSignupSession,
} from '@/features/auth'
import { useUpdateMyProfile } from '@/features/profile'
import { markSurveySkipped } from '@/shared/lib/surveySkip'
import {
  surveySchema,
  type SurveyFormData,
  type ProfileFormData,
  type InfoFormData,
} from '../model/schema'
import { StepContainer } from './StepContainer'
import { TextareaField, TextLabel } from '@/shared/ui'
import { CheckboxField } from './CheckboxField'

// [refactored] 라벨(선택) + TextareaField 블록 판박이(자기소개·집비우는·공간소개) 통합
type SurveyTextField = 'selfIntro' | 'awayTime' | 'livingSpace'

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
      maxLength={100}
      currentLength={length}
      {...register(name)}
    />
  </div>
)

const SurveyStep = () => {
  // 입양자 플로우의 마지막 데이터 단계 — 여기서 실제 가입(social/complete)을 호출한다.
  const { goBack, goNext, formData, setFormData } = useOnboarding()

  const { register, control, watch, handleSubmit, firstErrorMessage } = useStepForm<SurveyFormData>(
    'survey',
    surveySchema,
    {
      privacyAgreed: false as unknown as true,
      selfIntro: '',
      awayTime: '',
      livingSpace: '',
    },
  )

  const { mutate: completeAdopter, isPending } = useCompleteAdopterRegistration()
  const updateMyProfile = useUpdateMyProfile()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // "다음" → 입양자 가입 완료 처리 (성공 시에만 complete 단계로 이동)
  const handleComplete = (surveyData: SurveyFormData) => {
    if (isPending) return
    setFormData('survey', surveyData)
    setSubmitError(null)

    const social = loadSocialSignupSession()
    if (!social?.tempId) {
      setSubmitError(
        '소셜 가입 정보가 없습니다. 로그인 화면에서 소셜 로그인으로 다시 시작해주세요.',
      )
      return
    }

    const profile = (formData.profile ?? {}) as Partial<ProfileFormData>
    const info = (formData.info ?? {}) as Partial<InfoFormData>
    const email =
      social.email ||
      (profile.email && profile.emailDomain ? `${profile.email}@${profile.emailDomain}` : '')

    completeAdopter(
      {
        tempId: social.tempId,
        email,
        // 백엔드 DTO 는 name 을 필수로 요구 — 소셜 이름이 없으면 닉네임으로 대체
        name: social.name || info.nickname || '',
        nickname: info.nickname ?? '',
        phone: profile.phone,
        marketingAgreed: profile.marketingAgreed ?? false,
        // InfoStep 에서 업로드한 프로필 이미지(URL/파일명) — 없으면 미전송
        profileImage: info.profileImage || undefined,
      },
      {
        onSuccess: async (auth) => {
          // 발급 토큰을 쿠키로 저장해 로그인 상태로 전환
          try {
            await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: auth.accessToken,
                refreshToken: auth.refreshToken,
              }),
              credentials: 'include',
            })
          } catch {
            // 쿠키 저장에 실패해도 가입 자체는 완료된 상태 — 완료 화면으로 진행
          }
          // 가입 때 적은 자기소개를 프로필 소개(bio)로 저장 (베스트에포트 — 실패해도 가입은 완료)
          const intro = surveyData.selfIntro?.trim()
          if (intro) {
            try {
              await updateMyProfile.mutateAsync({ bio: intro })
            } catch {
              // bio 저장 실패는 무시 — 마이홈에서 다시 입력 가능
            }
          }
          clearSocialSignupSession()
          goNext()
        },
        onError: (error) => {
          setSubmitError(error instanceof Error ? error.message : '회원가입 완료에 실패했습니다.')
        },
      },
    )
  }

  return (
    <StepContainer
      title="간단한 조사 양식"
      onNext={() => handleSubmit(handleComplete)()}
      onBack={goBack}
      nextLabel={isPending ? '가입 중...' : '다음'}
      nextDisabled={isPending}
      navError={firstErrorMessage ?? submitError ?? undefined}
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
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                className="rounded-lg bg-neutral-100 px-2"
              />
            )}
          />
        </div>

        {/* 섹션 2: 조사 항목 — 버튼·라벨·텍스트에어리어 전부 flat gap 12px (Figma 966:22241) */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              // 조사 미작성 표시 후 가입 완료 진행 — 입양 신청(apply) 시 다시 작성받는다
              markSurveySkipped()
              handleSubmit(handleComplete)()
            }}
            className="flex items-center gap-0 self-end rounded-lg bg-neutral-850 px-2 py-1 text-[0.875rem] font-semibold text-neutral-50"
          >
            다음에 작성하기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="M9.7 18.3L15.3 12.7C15.4 12.6 15.475 12.4917 15.525 12.375C15.575 12.2583 15.6 12.1333 15.6 12C15.6 11.8667 15.575 11.7417 15.525 11.625C15.475 11.5083 15.4 11.4 15.3 11.3L9.7 5.7C9.38333 5.38333 9.31267 5.021 9.488 4.613C9.66267 4.20433 9.97467 4 10.424 4C10.8733 4 11.2 4.2 11.4 4.6L17.025 10.225C17.225 10.425 17.375 10.65 17.475 10.9C17.575 11.15 17.625 11.4167 17.625 11.7C17.625 11.9833 17.575 12.25 17.475 12.5C17.375 12.75 17.225 12.975 17.025 13.175L11.4 18.8C11.0833 19.1167 10.721 19.1877 10.313 19.013C9.90433 18.8377 9.7 18.5253 9.7 18.076V18.3Z"
                fill="#f6f6f6"
              />
            </svg>
          </button>

          {/* 자기소개 */}
          <SurveyTextarea
            name="selfIntro"
            label="간단하게 자기소개 부탁드려요"
            placeholder="성별, 연령대, 거주지, 결혼 계획, 생활 패턴 등"
            register={register}
            length={watch('selfIntro')?.length ?? 0}
          />

          {/* 공간/생활패턴 섹션 라벨 — 모바일 14 / tab+ 16 (Figma) */}
          <TextLabel size="14" requirement="선택" className="tab:text-base">
            반려동물이 지낼 공간과 생활패턴에 대해 알려주세요
          </TextLabel>

          <SurveyTextarea
            name="awayTime"
            label="평균적으로 집을 비우는 시간은 얼마나 되나요?"
            placeholder="출퇴근/외출 시간을 포함해 하루 중 집을 비우는 시간"
            register={register}
            length={watch('awayTime')?.length ?? 0}
          />

          <SurveyTextarea
            name="livingSpace"
            label="반려동물과 함께 지내게 될 공간을 소개해 주세요"
            placeholder="생활할 공간과 환경(크기/구조)"
            register={register}
            length={watch('livingSpace')?.length ?? 0}
          />
        </div>
      </div>
    </StepContainer>
  )
}

export { SurveyStep }
