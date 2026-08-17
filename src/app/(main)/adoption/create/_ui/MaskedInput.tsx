'use client'

import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input, type InputProps } from '@/shared/ui'
import { formatDateInput, formatPriceInput, restoreCaret } from '../_lib/maskFormat'

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
        const input = event.target
        const before = input.value
        const caret = input.selectionStart ?? before.length
        const formatted = format(before)

        // RHF 는 이벤트의 target.value 를 읽으므로, 넘기기 전에 포맷한 값으로 바꿔둔다
        input.value = formatted

        // value 를 바꾸면 캐럿이 끝으로 밀리므로 원래 자리로 되돌린다
        const restored = restoreCaret(before, formatted, caret)
        input.setSelectionRange(restored, restored)

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
