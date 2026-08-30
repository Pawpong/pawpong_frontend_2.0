'use client'

import { Controller } from 'react-hook-form'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckBreederNameDuplicate } from '../api/onboarding.mutations'
import { kennelInfoSchema, INTRODUCTION_MAX_LENGTH, REGIONS } from '../model/schema'
import { BREED_KEYWORDS } from '../model/breedKeywords'
import { StepContainer } from './StepContainer'
import { Dropdown, InputField, TextareaField } from '@/shared/ui'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }))

const KennelInfoStep = () => {
  const { register, control, handleSubmit, watch, onSubmit, firstErrorMessage, goBack } =
    useStepForm('kennel-info', kennelInfoSchema, {
      breederName: '',
      region: undefined,
      selectedBreeds: [],
      profileImage: undefined,
      introduction: '',
    })

  const breederName = watch('breederName')
  const introduction = watch('introduction')

  // 브리더명 중복 검사 (백엔드: POST /api/v2/auth/check-breeder-name)
  const breederNameCheck = useDuplicateCheck(useCheckBreederNameDuplicate(), {
    empty: '브리더명을 입력해주세요.',
    duplicate: '이미 사용 중인 브리더명입니다.',
    available: '사용 가능한 브리더명입니다.',
    fallback: '중복검사에 실패했습니다.',
    unchecked: '브리더명 중복 확인을 완료해주세요.',
  })

  const handleNext = handleSubmit((data) => {
    if (breederNameCheck.validate(data.breederName)) onSubmit(data)
  })

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={handleNext}
      onBack={goBack}
      navError={firstErrorMessage}
      contentClassName="tab:max-w-[40.9727rem]"
    >
      <div className="flex w-full flex-col items-center gap-[2rem] px-5 tab:gap-[3.625rem] tab:px-0">
        {/* 업로드 후 받은 URL을 폼(profileImage)에 보관 → DocumentsStep의 가입 요청에서 전송 */}
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ProfileImageUpload value={field.value} onChange={field.onChange} />
          )}
        />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-4">
          {/* 브리더명 + 중복검사 — 공통 DuplicateCheckField */}
          <DuplicateCheckField
            label="별명"
            required
            placeholder="별명을 입력해주세요"
            checkLabel="중복 확인"
            pendingLabel="확인 중"
            value={breederName}
            registration={register('breederName')}
            check={breederNameCheck}
          />

          {/* 지역 */}
          <InputField label="주소" required>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Dropdown
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  placeholder="주소를 선택해주세요"
                  options={REGION_OPTIONS}
                />
              )}
            />
          </InputField>

          {/* 소개 — 일반 가입(InfoStep)과 동일 규격. 브리더 가입 DTO 엔 소개가 없어 가입 후 bio 로 저장 */}
          <TextareaField
            label="소개"
            placeholder="입력해보세요"
            maxLength={INTRODUCTION_MAX_LENGTH}
            currentLength={introduction?.length ?? 0}
            {...register('introduction')}
          />

          {/* 품종 키워드 — 별명·주소와 같은 필드 묶음 (간격 spacing/16) */}
          <Controller
            name="selectedBreeds"
            control={control}
            render={({ field }) => (
              <ChipSelect
                label="케어하고 있는 품종 (최대 5개)"
                items={[...BREED_KEYWORDS]}
                value={field.value}
                onChange={field.onChange}
                maxSelected={5}
              />
            )}
          />
        </div>
      </div>
    </StepContainer>
  )
}

export { KennelInfoStep }
