'use client'

import { Controller, type FieldErrors, type UseFormRegister, useFieldArray } from 'react-hook-form'
import { Dropdown, Input, InputField } from '@/shared/ui'
import { HEALTH_RECORD_TEXT_MAX_LENGTH } from '../_lib/constants'
import { createGeneticTestRow, createVaccinationRow } from '../_lib/defaultValues'
import { DOSE_OPTIONS, GENETIC_TEST_OPTIONS, VACCINATION_OPTIONS } from '../_lib/formOptions'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../_lib/schema'
import { DateInput } from './MaskedInput'
import { FormSection } from './FormSection'
import { HealthStatusBlock } from './HealthStatusBlock'
import { RemoveRowButton } from './AddRowButton'

interface HealthInfoSectionProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  errors: FieldErrors<AdoptionCreateFormValues>
}

const HealthInfoSection = ({ control, register, errors }: HealthInfoSectionProps) => {
  const {
    fields: vaccinationFields,
    append: appendVaccination,
    remove: removeVaccination,
  } = useFieldArray({ control, name: 'vaccinations' })
  const {
    fields: geneticTestFields,
    append: appendGeneticTest,
    remove: removeGeneticTest,
  } = useFieldArray({ control, name: 'geneticTests' })

  return (
    <FormSection title="건강 정보">
      {/* Figma 3137-387069: 제목 아래 콘텐츠 래퍼 — 예방 접종/유전병 두 블록 사이만 40 */}
      <div className="flex flex-col gap-10">
        <HealthStatusBlock
          control={control}
          register={register}
          label="예방 접종 현황"
          options={VACCINATION_OPTIONS}
          statusName="vaccinationStatus"
          statusError={errors.vaccinationStatus?.message}
          reasonName="vaccinationReason"
          reasonError={errors.vaccinationReason?.message}
          onAdd={() => appendVaccination(createVaccinationRow())}
        >
          {vaccinationFields.map((row, index) => {
            const rowErrors = errors.vaccinations?.[index]
            return (
              <div key={row.id} className="flex flex-col gap-2">
                <div className="flex flex-col gap-4 tab:flex-row">
                  <InputField className="tab:flex-1" error={rowErrors?.name?.message}>
                    <Input
                      placeholder="접종명"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`vaccinations.${index}.name`)}
                    />
                  </InputField>
                  <InputField className="tab:flex-1" error={rowErrors?.date?.message}>
                    <DateInput
                      placeholder="접종 날짜 (YYYY-MM-DD)"
                      registration={register(`vaccinations.${index}.date`)}
                    />
                  </InputField>
                  <InputField error={rowErrors?.dose?.message}>
                    <Controller
                      name={`vaccinations.${index}.dose`}
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={DOSE_OPTIONS}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="차수"
                          className="tab:w-25"
                        />
                      )}
                    />
                  </InputField>
                </div>
                {/* [refactored] 행 삭제 버튼 공통화 */}
                <RemoveRowButton
                  label="접종 기록 삭제"
                  onClick={() => removeVaccination(index)}
                  visible={vaccinationFields.length > 1}
                />
              </div>
            )
          })}
        </HealthStatusBlock>

        <HealthStatusBlock
          control={control}
          register={register}
          label="유전병 검사"
          options={GENETIC_TEST_OPTIONS}
          statusName="geneticTestStatus"
          statusError={errors.geneticTestStatus?.message}
          reasonName="geneticTestReason"
          reasonError={errors.geneticTestReason?.message}
          onAdd={() => appendGeneticTest(createGeneticTestRow())}
        >
          {geneticTestFields.map((row, index) => {
            const rowErrors = errors.geneticTests?.[index]
            return (
              <div key={row.id} className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 tab:flex-row">
                  <InputField className="tab:flex-1" error={rowErrors?.testName?.message}>
                    <Input
                      placeholder="유전병명"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`geneticTests.${index}.testName`)}
                    />
                  </InputField>
                  <InputField className="tab:flex-1" error={rowErrors?.result?.message}>
                    <Input
                      placeholder="검사 결과"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`geneticTests.${index}.result`)}
                    />
                  </InputField>
                </div>
                <InputField error={rowErrors?.date?.message}>
                  <DateInput
                    placeholder="검진 날짜 (YYYY-MM-DD)"
                    registration={register(`geneticTests.${index}.date`)}
                  />
                </InputField>
                <InputField error={rowErrors?.institution?.message}>
                  <Input
                    placeholder="검사 기관"
                    maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                    {...register(`geneticTests.${index}.institution`)}
                  />
                </InputField>
                <RemoveRowButton
                  label="검사 기록 삭제"
                  onClick={() => removeGeneticTest(index)}
                  visible={geneticTestFields.length > 1}
                />
              </div>
            )
          })}
        </HealthStatusBlock>
      </div>
    </FormSection>
  )
}

export { HealthInfoSection }
