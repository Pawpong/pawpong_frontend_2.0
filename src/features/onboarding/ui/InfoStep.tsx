'use client'

import { Controller } from 'react-hook-form'
import { Input, InputField, KeywordTextField, TextareaField } from '@/shared/ui'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckNicknameDuplicate } from '../api/onboarding.mutations'
import { infoSchema, INTRODUCTION_MAX_LENGTH } from '../model/schema'
import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
import { StepContainer } from './StepContainer'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'
import { FieldError } from './FieldError'

const InfoStep = () => {
  const { register, control, handleSubmit, watch, onSubmit, formState, goBack } = useStepForm(
    'info',
    infoSchema,
    {
      realName: '',
      nickname: '',
      selectedKeywords: [],
      profileImage: undefined,
      introduction: '',
    },
  )

  const nickname = watch('nickname')
  const introduction = watch('introduction')

  // 닉네임 중복 검사 (백엔드: POST /api/v2/auth/check-nickname)
  const nicknameCheck = useDuplicateCheck(useCheckNicknameDuplicate(), {
    empty: '닉네임을 입력해주세요.',
    duplicate: '쓸 수 없는 별명이에요.',
    available: '쓸 수 있는 별명이에요.',
    fallback: '중복 여부를 확인하지 못했어요.',
    unchecked: '닉네임 중복 확인을 완료해주세요.',
  })

  const handleNext = handleSubmit((data) => {
    if (nicknameCheck.validate(data.nickname)) onSubmit(data)
  })

  return (
    <StepContainer
      title="나를 소개해주세요"
      subtitle="포퐁에서 사용할 활동명과 프로필을 만들어주세요."
      onNext={handleNext}
      onBack={goBack}
    >
      <>
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ProfileImageUpload value={field.value} onChange={field.onChange} />
          )}
        />

        {/* 포퐁 활동명 · 소개 (Figma 3414-752441) — 필드 사이 spacing/20 */}
        <div className={cn('flex w-full flex-col', STEP_LAYOUT.fieldGap)}>
          <InputField label="이름" required>
            <Input
              autoComplete="name"
              aria-label="이름"
              placeholder="입양 상담에 사용할 이름"
              {...register('realName')}
            />
            <FieldError message={formState.errors.realName?.message} />
            <p className="mt-2 text-body-sm text-neutral-700">
              공개 프로필에는 아래 활동명이 표시돼요.
            </p>
          </InputField>
          {/* 시안의 input-btn(gap 8, items-end) 구조 그대로 — 공통 DuplicateCheckField */}
          <DuplicateCheckField
            label="포퐁 활동명"
            required
            placeholder="별명을 입력해주세요"
            checkLabel="중복 확인"
            pendingLabel="확인 중"
            value={nickname}
            registration={register('nickname')}
            check={nicknameCheck}
            error={formState.errors.nickname?.message}
          />

          <TextareaField
            label="소개 (선택)"
            placeholder="반려동물과 함께하고 싶은 일상을 소개해주세요"
            maxLength={INTRODUCTION_MAX_LENGTH}
            currentLength={introduction?.length ?? 0}
            {...register('introduction')}
          />

          {/* 관심있는 키워드 — 활동명·소개와 같은 필드 묶음. 콤마 구분 자유 입력으로 받아
              가입 요청의 관심 품종 목록(interestedBreedIds)으로 보낸다 */}
          <InputField label="관심있는 키워드" requirement="선택">
            <Controller
              name="selectedKeywords"
              control={control}
              render={({ field }) => (
                <KeywordTextField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="관심있는 키워드를 콤마(,)로 구분해 입력해주세요"
                />
              )}
            />
          </InputField>
        </div>
      </>
    </StepContainer>
  )
}

export { InfoStep }
