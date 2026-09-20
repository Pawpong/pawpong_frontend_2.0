'use client'

import { Controller } from 'react-hook-form'
import { InputField, TextareaField } from '@/shared/ui'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckNicknameDuplicate } from '../api/onboarding.mutations'
import { infoSchema, INTRODUCTION_MAX_LENGTH } from '../model/schema'
import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
import { StepContainer } from './StepContainer'
import { KeywordTextField } from './KeywordTextField'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'

const InfoStep = () => {
  const { register, control, handleSubmit, watch, onSubmit, firstErrorMessage, goBack } =
    useStepForm('info', infoSchema, {
      nickname: '',
      selectedKeywords: [],
      profileImage: undefined,
      introduction: '',
    })

  const nickname = watch('nickname')
  const introduction = watch('introduction')

  // 닉네임 중복 검사 (백엔드: POST /api/v2/auth/check-nickname)
  const nicknameCheck = useDuplicateCheck(useCheckNicknameDuplicate(), {
    empty: '닉네임을 입력해주세요.',
    duplicate: '사용 불가능한 별명입니다.',
    available: '사용 가능한 별명입니다.',
    fallback: '중복 검사에 실패했습니다.',
    unchecked: '닉네임 중복 확인을 완료해주세요.',
  })

  const handleNext = handleSubmit((data) => {
    if (nicknameCheck.validate(data.nickname)) onSubmit(data)
  })

  return (
    <StepContainer
      title="회원 정보를 입력해주세요"
      onNext={handleNext}
      onBack={goBack}
      navError={firstErrorMessage}
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
          />

          <TextareaField
            label="소개"
            placeholder="입력해보세요"
            maxLength={INTRODUCTION_MAX_LENGTH}
            currentLength={introduction?.length ?? 0}
            {...register('introduction')}
          />

          {/* 관심있는 키워드 — 활동명·소개와 같은 필드 묶음. 서버로 전송되진 않지만
              같은 방식(콤마 구분 자유 입력)으로 통일한다 */}
          <InputField label="관심있는 키워드">
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
