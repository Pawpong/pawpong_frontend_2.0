'use client'

import { Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Dropdown, Input, InputField } from '@/shared/ui'
import { PARENT_IMAGE_MAX, PARENT_MAX_COUNT, PARENT_TEXT_MAX_LENGTH } from '../_lib/constants'
import { RELATIONSHIP_OPTIONS } from '../_lib/formOptions'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../_lib/schema'
import { FormSection } from './FormSection'
import { AddRowButton, RemoveRowButton } from './AddRowButton'
import { DateInput } from './MaskedInput'
import { ImageField } from './ImageField'

/** 행 목록과 행별 사진을 함께 넘겨받는다 — 둘의 동기화는 useAdoptionCreateForm 이 책임진다 */
interface ParentRows {
  fields: { id: string }[]
  append: () => void
  remove: (index: number) => void
  imagesOf: (rowId: string) => string[]
  addImage: (rowId: string, files: FileList) => void
  removeImage: (rowId: string) => void
}

interface ParentInfoSectionProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  errors: FieldErrors<AdoptionCreateFormValues>
  parentRows: ParentRows
}

const ParentInfoSection = ({ control, register, errors, parentRows }: ParentInfoSectionProps) => {
  const { fields, append, remove, imagesOf, addImage, removeImage } = parentRows

  return (
    <FormSection title="부모 정보">
      {/* 콘텐츠 -> 추가 버튼 간격은 16 (건강 정보 섹션과 동일).
          제목 -> 콘텐츠 간격은 FormSection 의 20 을 그대로 둬야 해서 한 겹 더 감쌌다 */}
      <div className="flex flex-col gap-4">
        {/* 부모 행 사이 20 — 서버가 부모별 photoFileName 을 받으므로 행마다 [사진][입력] 한 세트 */}
        <div className="flex flex-col gap-5">
          {fields.map((row, index) => {
            const rowErrors = errors.parents?.[index]
            return (
              // Figma 3137-390591: PC는 이미지 372 + 입력 컬럼 2단(gap 20), 모바일은 세로 스택
              <div key={row.id} className="flex flex-col gap-5 pc:flex-row">
                <ImageField
                  images={imagesOf(row.id)}
                  onAdd={(files) => addImage(row.id, files)}
                  onRemove={() => removeImage(row.id)}
                  maxImages={PARENT_IMAGE_MAX}
                />

                <div className="flex flex-1 flex-col justify-center gap-3">
                  <InputField label="관계" required error={rowErrors?.relationship?.message}>
                    <Controller
                      name={`parents.${index}.relationship`}
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={RELATIONSHIP_OPTIONS}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="선택해보세요"
                        />
                      )}
                    />
                  </InputField>

                  <InputField label="이름" required error={rowErrors?.name?.message}>
                    <Input
                      placeholder="입력해보세요"
                      maxLength={PARENT_TEXT_MAX_LENGTH}
                      {...register(`parents.${index}.name`)}
                    />
                  </InputField>

                  <InputField label="품종" required error={rowErrors?.breed?.message}>
                    <Input
                      placeholder="입력해보세요"
                      maxLength={PARENT_TEXT_MAX_LENGTH}
                      {...register(`parents.${index}.breed`)}
                    />
                  </InputField>

                  <InputField label="태어난 날짜" required error={rowErrors?.birthDate?.message}>
                    <DateInput
                      placeholder="YYYY-MM-DD 형식으로 입력해주세요"
                      registration={register(`parents.${index}.birthDate`)}
                    />
                  </InputField>

                  {/* [refactored] 행 삭제 버튼 공통화 */}
                  <RemoveRowButton
                    label="부모 정보 삭제"
                    onClick={() => remove(index)}
                    visible={fields.length > 1}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <AddRowButton
          label="부모정보 추가하기"
          onClick={append}
          disabled={fields.length >= PARENT_MAX_COUNT}
        />
      </div>
    </FormSection>
  )
}

export { ParentInfoSection }
