'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckNicknameDuplicate } from '@/features/auth'
import { infoSchema, type InfoFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'

const SAMPLE_KEYWORDS = [
  '비숑',
  '도베르만',
  '골든리트리버',
  '푸들',
  '시바이누',
  '말티즈',
  '포메라니안',
  '코기',
  '허스키',
  '사모예드',
  '래브라도',
  '치와와',
  '닥스훈트',
  '보더콜리',
  '슈나우저',
  '비글',
  '요크셔테리어',
  '웰시코기',
  '진돗개',
  '삽살개',
  '풍산개',
]

const InfoStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, watch, onSubmit, firstErrorMessage } =
    useStepForm<InfoFormData>('info', infoSchema, {
      nickname: '',
      selectedKeywords: [],
      profileImage: '',
    })

  const nickname = watch('nickname')

  // 닉네임 중복 검사 (백엔드: POST /api/v2/auth/check-nickname)
  const nicknameCheck = useDuplicateCheck(useCheckNicknameDuplicate(), {
    empty: '닉네임을 입력해주세요.',
    duplicate: '사용 불가능한 별명입니다.',
    available: '사용 가능한 별명입니다.',
    fallback: '중복 검사에 실패했습니다.',
  })

  return (
    <StepContainer
      title="회원 정보를 입력해주세요"
      onNext={() => handleSubmit(onSubmit)()}
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

        {/* 별명 + 중복 확인 (Figma 966-20830) — 공통 DuplicateCheckField */}
        <DuplicateCheckField
          label="별명"
          required
          placeholder="별명을 입력해주세요"
          checkLabel="중복 확인"
          pendingLabel="확인 중"
          value={nickname}
          registration={register('nickname')}
          check={nicknameCheck}
        />

        {/* 관심있는 키워드 (ChipSelect 자체가 w-full flex-col) */}
        <Controller
          name="selectedKeywords"
          control={control}
          render={({ field }) => (
            <ChipSelect
              label="관심있는 키워드"
              items={SAMPLE_KEYWORDS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </>
    </StepContainer>
  )
}

export { InfoStep }
