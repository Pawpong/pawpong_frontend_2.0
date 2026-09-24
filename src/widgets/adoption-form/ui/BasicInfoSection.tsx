'use client'

import { Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Dropdown, Input, InputField, TextareaField } from '@/shared/ui'
import { PET_DESCRIPTION_MAX_LENGTH } from '../lib/constants'
import { GENDER_OPTIONS } from '../lib/formOptions'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../lib/schema'
import { DateInput, PriceInput } from './MaskedInput'
import { FormSection } from './FormSection'

interface BasicInfoSectionProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  errors: FieldErrors<AdoptionCreateFormValues>
}

/** 이름·품종·태어난 날·성별·소개글·분양가 */
const BasicInfoSection = ({ control, register, errors }: BasicInfoSectionProps) => (
  <FormSection
    title="기본 정보"
    step={2}
    required
    description="입양자가 아이를 알아볼 수 있도록 정확한 정보를 알려주세요."
  >
    <div className="grid gap-5 tab:grid-cols-2">
      <InputField label="이름" required error={errors.name?.message}>
        <Input
          aria-label="이름"
          placeholder="아이의 이름을 입력해주세요"
          maxLength={50}
          {...register('name')}
        />
      </InputField>

      <InputField label="품종" required error={errors.breed?.message}>
        <Input
          aria-label="품종"
          placeholder="예: 포메라니안, 브리티시 쇼트헤어"
          maxLength={50}
          {...register('breed')}
        />
      </InputField>

      <InputField label="태어난 날" required error={errors.birthDate?.message}>
        <DateInput
          aria-label="태어난 날"
          placeholder="YYYY-MM-DD 형식으로 입력해주세요"
          registration={register('birthDate')}
        />
      </InputField>

      <InputField label="성별" required error={errors.gender?.message}>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Dropdown
              ariaLabel="성별"
              options={GENDER_OPTIONS}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="성별 선택"
            />
          )}
        />
      </InputField>
    </div>

    <TextareaField
      label="아이 소개"
      required
      placeholder="성격과 좋아하는 것, 식사·생활 습관을 알려주세요. 치료 중인 질환이나 돌봄 시 주의할 점도 함께 적어주세요."
      className="min-h-36"
      maxLength={PET_DESCRIPTION_MAX_LENGTH}
      error={errors.introduction?.message}
      {...register('introduction')}
    />

    <InputField label="분양가 (원)" required error={errors.price?.message}>
      <PriceInput
        aria-label="분양가 (원)"
        placeholder="예: 300,000"
        registration={register('price')}
      />
    </InputField>
  </FormSection>
)

export { BasicInfoSection }
