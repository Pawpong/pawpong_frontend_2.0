'use client'

import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input, InputField, HelpMessage } from '@/shared/ui'
import { StepActionButton } from './StepInput'
import type { useDuplicateCheck } from '../model/useDuplicateCheck'

// [refactored] InfoStep 별명 · KennelInfoStep 브리더명의 판박이 필드
// (InputField + Input + 중복확인 버튼 + HelpMessage + useDuplicateCheck) 통합.
// label 미지정 시 InputField가 라벨 없이 래핑만 하므로 두 케이스 모두 커버.
interface DuplicateCheckFieldProps {
  label?: string
  required?: boolean
  placeholder: string
  /** 중복확인 버튼 문구 (예: "중복 확인" / "중복검사") */
  checkLabel: string
  /** 검사 중 버튼 문구 (예: "확인 중" / "검사 중") */
  pendingLabel: string
  /** 현재 입력값 (check 호출에 전달) */
  value: string
  registration: UseFormRegisterReturn
  check: ReturnType<typeof useDuplicateCheck>
}

const DuplicateCheckField = ({
  label,
  required,
  placeholder,
  checkLabel,
  pendingLabel,
  value,
  registration,
  check,
}: DuplicateCheckFieldProps) => (
  <InputField label={label} required={required} className="w-full">
    <div className="flex w-full items-end gap-2">
      <Input type="text" placeholder={placeholder} {...registration} className="flex-1" />
      <StepActionButton onClick={() => check.check(value)} disabled={check.isPending}>
        {check.isPending ? pendingLabel : checkLabel}
      </StepActionButton>
    </div>
    {check.message && (
      <HelpMessage status={check.message.status} className="mt-1">
        {check.message.text}
      </HelpMessage>
    )}
  </InputField>
)

export { DuplicateCheckField }
