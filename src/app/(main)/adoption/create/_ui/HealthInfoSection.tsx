'use client'

import { type FieldErrors, type UseFormRegister, useFieldArray } from 'react-hook-form'
import { Input, InputField } from '@/shared/ui'
import { HEALTH_RECORD_TEXT_MAX_LENGTH } from '../_lib/constants'
import { createGeneticTestRow, createVaccinationRow } from '../_lib/defaultValues'
import { GENETIC_TEST_OPTIONS, VACCINATION_OPTIONS } from '../_lib/formOptions'
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
    <FormSection
      title="건강 정보"
      step={3}
      required
      description="접종수첩과 검사 결과서를 보며 작성해주세요. 기록은 여러 개 추가할 수 있고, 접종·검사 완료가 모든 질병에 대한 건강을 보장하지는 않아요."
    >
      <div className="flex flex-col gap-8">
        <HealthStatusBlock
          control={control}
          register={register}
          label="예방접종 상태"
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
              <div key={row.id} className="flex flex-col gap-4 rounded-xl bg-point-50 p-4 tab:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-neutral-850">접종 기록 {index + 1}</h4>
                  <RemoveRowButton
                    label={`접종 기록 ${index + 1} 삭제`}
                    onClick={() => removeVaccination(index)}
                    visible
                  />
                </div>
                <div className="grid gap-4 tab:grid-cols-2">
                  <InputField
                    label="백신명"
                    className="tab:col-span-2"
                    error={rowErrors?.name?.message}
                  >
                    <Input
                      aria-label={`접종 기록 ${index + 1} 백신명`}
                      placeholder="접종수첩에 적힌 백신명 또는 제품명"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`vaccinations.${index}.name`)}
                    />
                  </InputField>
                  <InputField label="접종일" error={rowErrors?.date?.message}>
                    <DateInput
                      aria-label={`접종 기록 ${index + 1} 접종일`}
                      placeholder="YYYY-MM-DD"
                      registration={register(`vaccinations.${index}.date`)}
                    />
                  </InputField>
                  <InputField label="해당 백신의 차수" error={rowErrors?.dose?.message}>
                    <Input
                      aria-label={`접종 기록 ${index + 1} 차수`}
                      inputMode="numeric"
                      placeholder="예: 1 (1차 접종)"
                      {...register(`vaccinations.${index}.dose`)}
                    />
                  </InputField>
                </div>
              </div>
            )
          })}
        </HealthStatusBlock>

        <div className="h-px bg-neutral-150" />

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
              <div key={row.id} className="flex flex-col gap-4 rounded-xl bg-point-50 p-4 tab:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-neutral-850">검사 기록 {index + 1}</h4>
                  <RemoveRowButton
                    label={`검사 기록 ${index + 1} 삭제`}
                    onClick={() => removeGeneticTest(index)}
                    visible
                  />
                </div>
                <div className="grid gap-4 tab:grid-cols-2">
                  <InputField label="검사명" error={rowErrors?.testName?.message}>
                    <Input
                      aria-label={`검사 기록 ${index + 1} 검사명`}
                      placeholder="검사명 (예: 검사서에 적힌 명칭)"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`geneticTests.${index}.testName`)}
                    />
                  </InputField>
                  <InputField label="검사 결과" error={rowErrors?.result?.message}>
                    <Input
                      aria-label={`검사 기록 ${index + 1} 결과`}
                      placeholder="결과서에 적힌 내용을 입력해주세요"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`geneticTests.${index}.result`)}
                    />
                  </InputField>
                  <InputField label="검사일" error={rowErrors?.date?.message}>
                    <DateInput
                      aria-label={`검사 기록 ${index + 1} 검사일`}
                      placeholder="YYYY-MM-DD"
                      registration={register(`geneticTests.${index}.date`)}
                    />
                  </InputField>
                  <InputField label="검사 기관" error={rowErrors?.institution?.message}>
                    <Input
                      aria-label={`검사 기록 ${index + 1} 기관`}
                      placeholder="동물병원 또는 검사 기관명"
                      maxLength={HEALTH_RECORD_TEXT_MAX_LENGTH}
                      {...register(`geneticTests.${index}.institution`)}
                    />
                  </InputField>
                </div>
              </div>
            )
          })}
        </HealthStatusBlock>
      </div>
    </FormSection>
  )
}

export { HealthInfoSection }
