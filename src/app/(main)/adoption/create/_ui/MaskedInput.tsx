'use client'

import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input, type InputProps } from '@/shared/ui'

/**
 * 숫자만 남겨 YYYY-MM-DD 로 끼워 넣는다.
 *
 * 하이픈 위치를 기억하지 않고 매번 자리수로만 판단해서, 지울 때 하이픈에 걸려 멈추지 않는다.
 * (예: '2024-05' 에서 5를 지우면 '2024-0' → 하이픈 앞까지 지우면 '2024')
 */
export const formatDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

/** 숫자만 남겨 천 단위 쉼표를 넣는다. 선행 0 은 버린다 ('007' → '7') */
export const formatPriceInput = (value: string): string =>
  value
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

interface MaskedInputProps extends Omit<InputProps, 'onChange' | 'type' | 'inputMode'> {
  registration: UseFormRegisterReturn
  format: (value: string) => string
}

/** 입력값을 즉시 포맷해 폼에 넣는 input — 포맷 규칙만 갈아 끼운다 */
const MaskedInput = ({ registration, format, ...props }: MaskedInputProps) => {
  const { onChange, ...rest } = registration

  return (
    <Input
      type="text"
      inputMode="numeric"
      {...props}
      {...rest}
      onChange={(event) => {
        // RHF 는 이벤트의 target.value 를 읽으므로, 넘기기 전에 포맷한 값으로 바꿔둔다
        event.target.value = format(event.target.value)
        return onChange(event)
      }}
    />
  )
}

type MaskedFieldProps = Omit<MaskedInputProps, 'format'>

/** YYYY-MM-DD 입력 — 숫자만 치면 하이픈이 자동으로 붙는다 */
const DateInput = (props: MaskedFieldProps) => (
  <MaskedInput maxLength={10} {...props} format={formatDateInput} />
)

/** 금액 입력 — 숫자만 치면 천 단위 쉼표가 자동으로 붙는다 */
const PriceInput = (props: MaskedFieldProps) => <MaskedInput {...props} format={formatPriceInput} />

export { DateInput, PriceInput }
