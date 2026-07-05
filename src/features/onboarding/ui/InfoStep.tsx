'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckNicknameDuplicate } from '@/features/auth'
import { type InfoFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { Input, HelpMessage } from '@/shared/ui'
import { StepActionButton } from './StepInput'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'

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

  const { register, control, handleSubmit, watch, onSubmit } = useStepForm<InfoFormData>('info', {
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
    >
      <>
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ProfileImageUpload value={field.value} onChange={field.onChange} />
          )}
        />

        {/* 닉네임 + 중복검사 */}
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full gap-2">
            <Input type="text" placeholder="닉네임" {...register('nickname')} className="flex-1" />
            <StepActionButton
              onClick={() => nicknameCheck.check(nickname)}
              disabled={nicknameCheck.isPending}
            >
              {nicknameCheck.isPending ? '검사 중' : '중복 검사'}
            </StepActionButton>
          </div>
          {nicknameCheck.message && (
            <HelpMessage status={nicknameCheck.message.status}>
              {nicknameCheck.message.text}
            </HelpMessage>
          )}
        </div>

        {/* 관심있는 키워드 */}
        <div className="flex w-full flex-col">
          <Controller
            name="selectedKeywords"
            control={control}
            render={({ field }) => (
              <ChipSelect
                label="관심있는 키워드"
                items={SAMPLE_KEYWORDS}
                selected={field.value}
                onToggle={(keyword) => {
                  const next = field.value.includes(keyword)
                    ? field.value.filter((k) => k !== keyword)
                    : [...field.value, keyword]
                  field.onChange(next)
                }}
              />
            )}
          />
        </div>
      </>
    </StepContainer>
  )
}

export { InfoStep }
