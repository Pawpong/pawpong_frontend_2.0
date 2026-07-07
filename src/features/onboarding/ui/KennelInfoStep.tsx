'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckBreederNameDuplicate } from '@/features/auth'
import { type KennelInfoFormData, REGIONS } from '../model/schema'
import { StepContainer } from './StepContainer'
import { TextareaField } from '@/shared/ui'
import { StepSelect } from './StepInput'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }))

const BREED_KEYWORDS = [
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
]

const KennelInfoStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, watch, onSubmit } = useStepForm<KennelInfoFormData>(
    'kennel-info',
    {
      breederName: '',
      region: undefined,
      selectedBreeds: [],
      profileImage: undefined,
      introduction: '',
    },
  )

  const breederName = watch('breederName')

  // 브리더명 중복 검사 (백엔드: POST /api/v2/auth/check-breeder-name)
  const breederNameCheck = useDuplicateCheck(useCheckBreederNameDuplicate(), {
    empty: '브리더명을 입력해주세요.',
    duplicate: '이미 사용 중인 브리더명입니다.',
    available: '사용 가능한 브리더명입니다.',
    fallback: '중복검사에 실패했습니다.',
  })

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
    >
      <div className="mt-[2rem] flex w-full flex-col items-center gap-[2rem] px-5 tab:mt-[3.625rem] tab:max-w-[40.625rem] tab:gap-[3.625rem] tab:px-0">
        {/* 업로드 후 받은 URL을 폼(profileImage)에 보관 → DocumentsStep의 social/complete에서 전송 */}
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ProfileImageUpload value={field.value} onChange={field.onChange} />
          )}
        />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-[0.625rem] tab:gap-[2.09rem]">
          {/* 브리더명 + 중복검사 — 공통 DuplicateCheckField */}
          <DuplicateCheckField
            placeholder="브리더명(상호명)"
            checkLabel="중복검사"
            pendingLabel="검사 중"
            value={breederName}
            registration={register('breederName')}
            check={breederNameCheck}
          />

          {/* 지역 */}
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <StepSelect
                value={field.value ?? ''}
                onValueChange={field.onChange}
                placeholder="지역"
                options={REGION_OPTIONS}
              />
            )}
          />

          {/* 품종 키워드 */}
          <div className="flex flex-col">
            <Controller
              name="selectedBreeds"
              control={control}
              render={({ field }) => (
                <ChipSelect
                  label={
                    <>
                      <span className="hidden tab:inline">품종</span>
                      <span className="tab:hidden">관심있는 키워드</span>
                    </>
                  }
                  items={BREED_KEYWORDS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* 소개 — 가입 완료 후 프로필 bio(PATCH /profile/me)로 저장 */}
          <TextareaField
            label="소개"
            placeholder="브리더 소개를 입력해주세요"
            maxLength={100}
            currentLength={watch('introduction')?.length ?? 0}
            {...register('introduction')}
          />
        </div>
      </div>
    </StepContainer>
  )
}

export { KennelInfoStep }
