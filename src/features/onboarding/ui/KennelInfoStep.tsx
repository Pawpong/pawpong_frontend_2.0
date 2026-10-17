'use client'

import { Controller } from 'react-hook-form'
import { useDistrictOptions } from '@/entities/district'
import { useStepForm } from '../model/useStepForm'
import { useDuplicateCheck } from '../model/useDuplicateCheck'
import { useCheckBreederNameDuplicate } from '../api/onboarding.mutations'
import { kennelInfoSchema, INTRODUCTION_MAX_LENGTH } from '../model/schema'
import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
import { StepContainer } from './StepContainer'
import { Dropdown, InputField, KeywordTextField, TextareaField } from '@/shared/ui'
import { ProfileImageUpload } from './ProfileImageUpload'
import { DuplicateCheckField } from './DuplicateCheckField'
import { FieldError } from './FieldError'

const KennelInfoStep = () => {
  const { register, control, setValue, handleSubmit, watch, onSubmit, formState, goBack } =
    useStepForm('kennel-info', kennelInfoSchema, {
      breederName: '',
      city: '',
      district: '',
      selectedBreeds: [],
      profileImage: undefined,
      introduction: '',
    })

  const breederName = watch('breederName')
  const introduction = watch('introduction')
  const city = watch('city')

  const { cityOptions, districtOptions } = useDistrictOptions(city)

  // 브리더명 중복 검사 (백엔드: POST /api/v2/auth/check-breeder-name)
  const breederNameCheck = useDuplicateCheck(useCheckBreederNameDuplicate(), {
    empty: '브리더명을 입력해주세요.',
    duplicate: '이미 쓰고 있는 브리더명이에요.',
    available: '쓸 수 있는 브리더명이에요.',
    fallback: '중복 여부를 확인하지 못했어요.',
    unchecked: '브리더명 중복 확인을 완료해주세요.',
  })

  const handleNext = handleSubmit((data) => {
    if (breederNameCheck.validate(data.breederName)) onSubmit(data)
  })

  return (
    <StepContainer
      title="브리더를 소개해주세요"
      subtitle="입양 가족에게 보여질 프로필이에요. 필수 정보부터 채워주세요."
      onNext={handleNext}
      onBack={goBack}
    >
      <div className={cn('flex w-full flex-col items-center px-1 tab:px-0', STEP_LAYOUT.blockGap)}>
        {/* 업로드 후 받은 URL을 폼(profileImage)에 보관 → DocumentsStep의 가입 요청에서 전송 */}
        <Controller
          name="profileImage"
          control={control}
          render={({ field }) => (
            <ProfileImageUpload value={field.value} onChange={field.onChange} />
          )}
        />

        {/* 폼 영역 */}
        <div className={cn('flex w-full flex-col', STEP_LAYOUT.fieldGap)}>
          {/* 브리더명 + 중복검사 — 공통 DuplicateCheckField */}
          <DuplicateCheckField
            label="브리더명"
            required
            placeholder="활동하는 브리더명 또는 켄넬명"
            checkLabel="중복 확인"
            pendingLabel="확인 중"
            value={breederName}
            registration={register('breederName')}
            check={breederNameCheck}
            error={formState.errors.breederName?.message}
          />

          {/* 지역 — 시/도를 바꾸면 이전 시/군구는 그 시/도에 없는 값이라 비운다 */}
          <InputField label="활동 지역" required>
            <div className="flex flex-col gap-2">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    onValueChange={(next) => {
                      field.onChange(next)
                      setValue('district', '')
                    }}
                    placeholder="시/도를 선택해주세요"
                    options={cityOptions}
                  />
                )}
              />
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="시/군구 선택 (선택사항)"
                    options={districtOptions}
                    disabled={!city}
                  />
                )}
              />
            </div>
            <FieldError message={formState.errors.city?.message} />
          </InputField>

          {/* 소개 — 일반 가입(InfoStep)과 동일 규격. 브리더 가입 DTO 엔 소개가 없어 가입 후 bio 로 저장 */}
          <TextareaField
            label="소개 (선택)"
            placeholder="브리딩 철학과 아이들을 돌보는 환경을 소개해주세요"
            maxLength={INTRODUCTION_MAX_LENGTH}
            currentLength={introduction?.length ?? 0}
            {...register('introduction')}
          />

          {/* 품종 키워드 — 별명·주소와 같은 필드 묶음 (간격 spacing/16).
              서버는 breeds 를 자유 문자열 배열로 받아(enum 없음) 콤마 구분 입력으로 받는다 */}
          <InputField label="케어하고 있는 품종 (최대 5개)" required>
            <Controller
              name="selectedBreeds"
              control={control}
              render={({ field }) => (
                <KeywordTextField
                  value={field.value}
                  onChange={field.onChange}
                  maxSelected={5}
                  placeholder="품종을 콤마(,)로 구분해 입력해주세요"
                />
              )}
            />
            <FieldError message={formState.errors.selectedBreeds?.message} />
          </InputField>
        </div>
      </div>
    </StepContainer>
  )
}

export { KennelInfoStep }
