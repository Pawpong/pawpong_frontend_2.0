'use client'

import { Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Dropdown, Input, InputField, TextareaField } from '@/shared/ui'
import { PET_DESCRIPTION_MAX_LENGTH } from '../_lib/constants'
import { GENDER_OPTIONS } from '../_lib/formOptions'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../_lib/schema'
import { DateInput, PriceInput } from './MaskedInput'

interface BasicInfoSectionProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  errors: FieldErrors<AdoptionCreateFormValues>
}

/** 이름·품종·태어난 날·성별·소개글·분양가 */
const BasicInfoSection = ({ control, register, errors }: BasicInfoSectionProps) => (
  <>
    <InputField label="이름" required error={errors.name?.message}>
      <Input placeholder="입력해보세요" {...register('name')} />
    </InputField>

    <InputField label="품종" required error={errors.breed?.message}>
      <Input placeholder="입력해보세요" {...register('breed')} />
    </InputField>

    <InputField label="태어난 날" required error={errors.birthDate?.message}>
      <DateInput
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
            options={GENDER_OPTIONS}
            value={field.value}
            onValueChange={field.onChange}
            placeholder="선택해보세요"
          />
        )}
      />
    </InputField>

    <TextareaField
      label="분양할 동물 소개글"
      required
      placeholder="입력해보세요"
      className="pc:h-45"
      maxLength={PET_DESCRIPTION_MAX_LENGTH}
      error={errors.introduction?.message}
      {...register('introduction')}
    />

    <InputField label="분양가" required error={errors.price?.message}>
      <PriceInput placeholder="입력해보세요" registration={register('price')} />
    </InputField>
  </>
)

export { BasicInfoSection }
