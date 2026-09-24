'use client'

import type { ReactNode } from 'react'
import { Controller, useWatch, type UseFormRegister } from 'react-hook-form'
import { TextareaField } from '@/shared/ui'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import { HEALTH_REASON_MAX_LENGTH } from '../_lib/constants'
import { AddRowButton } from './AddRowButton'
import type { AdoptionCreateFormValues, AdoptionFormControl } from '../_lib/schema'

/** 현재 상태와 실제 기록은 독립적으로 입력한다. 상태 전환으로 기록을 지우지 않는다. */
const INCOMPLETE_REASON_PLACEHOLDER = '현재 상태와 미완료 사유, 예정된 일정이 있다면 알려주세요'

type HealthFieldNames =
  | { statusName: 'vaccinationStatus'; reasonName: 'vaccinationReason' }
  | { statusName: 'geneticTestStatus'; reasonName: 'geneticTestReason' }

interface HealthStatusBlockCommonProps {
  control: AdoptionFormControl
  register: UseFormRegister<AdoptionCreateFormValues>
  label: string
  options: { value: string; label: string; description?: string }[]
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
  const reason = useWatch({ control, name: reasonName })
  const isVaccination = statusName === 'vaccinationStatus'

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name={statusName}
        control={control}
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            label={label}
            options={options}
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={statusError}
          />
        )}
      />
      {status === 'incomplete' && (
        <TextareaField
          label={isVaccination ? '현재 접종 상황과 남은 일정' : '검사를 마치지 않은 이유와 예정'}
          aria-label={
            isVaccination ? '현재 접종 상황과 남은 일정' : '검사를 마치지 않은 이유와 예정'
          }
          required
          error={reasonError}
          placeholder={INCOMPLETE_REASON_PLACEHOLDER}
          currentLength={reason.length}
          className="min-h-24"
          maxLength={HEALTH_REASON_MAX_LENGTH}
          {...register(reasonName)}
        />
      )}
      {status && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-850">
              {isVaccination ? '실제로 받은 접종 기록' : '결과가 나온 검사 기록'}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-700">
              {status === 'completed'
                ? '확인 가능한 기록을 1개 이상 입력해주세요.'
                : '이미 받은 기록이 있다면 추가해주세요. 아직 없다면 비워두세요.'}{' '}
              {isVaccination && '차수는 해당 백신 기준으로 적어주세요.'}
            </p>
          </div>
          {children}
          <AddRowButton
            label={isVaccination ? '접종 기록 추가' : '검사 기록 추가'}
            onClick={onAdd}
          />
        </div>
      )}
    </div>
  )
}

export { HealthStatusBlock }
