'use client'

import type { ReactNode } from 'react'
import { Controller, useWatch, type UseFormRegister } from 'react-hook-form'
import { Dropdown, Input, InputField } from '@/shared/ui'
import { HEALTH_REASON_MAX_LENGTH } from '../_lib/constants'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../_lib/schema'
import { AddRowButton } from './AddRowButton'

/**
 * [refactored] 예방 접종 / 유전병 검사 블록의 공통 골격.
 *
 * 두 블록 모두 "상태 드롭다운 → (완료면 기록 입력 + 작성란 추가 / 아니면 미완료 사유)" 구조가 같고
 * 기록 입력란의 구성만 다르다. 그 부분만 children 으로 받는다.
 */
const INCOMPLETE_REASON_PLACEHOLDER = '미완료한 이유작성 (예: 태어난지 한달도 안됨)'

type HealthFieldNames =
  | { statusName: 'vaccinationStatus'; reasonName: 'vaccinationReason' }
  | { statusName: 'geneticTestStatus'; reasonName: 'geneticTestReason' }

interface HealthStatusBlockCommonProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  label: string
  options: { value: string; label: string }[]
  statusError?: string
  reasonError?: string
  onAdd: () => void
  /** 기록 입력란 (블록마다 구성이 다르다) */
  children: ReactNode
}

type HealthStatusBlockProps = HealthStatusBlockCommonProps & HealthFieldNames

const HealthStatusBlock = ({
  control,
  register,
  label,
  options,
  statusName,
  statusError,
  reasonName,
  reasonError,
  onAdd,
  children,
}: HealthStatusBlockProps) => {
  const status = useWatch({ control, name: statusName })
  // 상태를 아직 안 고른 단계에서는 기록 입력란을 기본으로 보여준다
  const showRecords = status === 'completed' || !status

  return (
    <div className="flex flex-col gap-4">
      <InputField label={label} required error={statusError}>
        <Controller
          name={statusName}
          control={control}
          render={({ field }) => (
            <Dropdown
              options={options}
              value={typeof field.value === 'string' ? field.value : ''}
              onValueChange={field.onChange}
              placeholder="선택해보세요"
            />
          )}
        />
      </InputField>

      {showRecords ? (
        <>
          {children}
          <AddRowButton label="작성란 추가하기" onClick={onAdd} />
        </>
      ) : (
        <InputField error={reasonError}>
          <Input
            placeholder={INCOMPLETE_REASON_PLACEHOLDER}
            maxLength={HEALTH_REASON_MAX_LENGTH}
            {...register(reasonName)}
          />
        </InputField>
      )}
    </div>
  )
}

export { HealthStatusBlock }
