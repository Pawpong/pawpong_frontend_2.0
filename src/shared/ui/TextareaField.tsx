'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { Textarea, type TextareaProps } from './Textarea'

// [refactored] Figma color token(text/interactive/*) — 흩어져 있던 hex를 의미 단위로 명명
const TEXT = {
  primary: 'text-[#3e3e3e]',
  secondary: 'text-[#6b6b6b]',
  disabled: 'text-[#b8b8b8]',
  info: 'text-[#256ef4]',
  error: 'text-[#d63d4a]',
} as const

// [refactored] Figma status → 카운터(숫자/총량) 색 테이블 — 반복되던 삼항 체인을 선언적 lookup으로
const COUNTER_TONE = {
  default: { number: cn(TEXT.secondary, 'group-focus-within:text-[#256ef4]'), max: TEXT.secondary },
  fill: { number: TEXT.info, max: TEXT.secondary },
  error: { number: TEXT.error, max: TEXT.error },
  disabled: { number: TEXT.disabled, max: TEXT.disabled },
} as const

type CounterTone = keyof typeof COUNTER_TONE

interface TextareaFieldProps extends TextareaProps {
  label?: string
  required?: boolean
  error?: string
  currentLength?: number
  wrapperClassName?: string
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      required,
      error,
      currentLength,
      maxLength,
      wrapperClassName,
      state,
      disabled,
      ...props
    },
    ref,
  ) => {
    const showCounter = maxLength !== undefined && currentLength !== undefined
    const filled = (currentLength ?? 0) > 0

    // border: error > 명시적 state > 입력값(fill) > default (focus/disabled는 Textarea 의사클래스)
    const resolvedState = error ? 'error' : (state ?? (filled ? 'fill' : 'default'))

    // 색 tone: 위에서부터 처음 충족하는 status (없으면 default). 라벨은 disabled에만 반응
    const toneRules: [boolean, CounterTone][] = [
      [!!error, 'error'],
      [!!disabled, 'disabled'],
      [filled, 'fill'],
    ]
    const tone = toneRules.find(([matched]) => matched)?.[1] ?? 'default'
    const counter = COUNTER_TONE[tone]
    const labelColor = disabled ? TEXT.disabled : TEXT.primary
    const requiredColor = disabled ? TEXT.disabled : TEXT.secondary

    return (
      <div className={cn('group flex flex-col gap-[0.125rem]', wrapperClassName)}>
        {label && (
          <div className="flex items-center gap-1">
            <span
              className={cn('p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold', labelColor)}
            >
              {label}
            </span>
            {required && (
              <span
                className={cn(
                  'p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium',
                  requiredColor,
                )}
              >
                필수
              </span>
            )}
          </div>
        )}
        <Textarea
          ref={ref}
          state={resolvedState}
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />
        {showCounter && (
          <p className="text-end text-[0.625rem] leading-[1.5] font-medium">
            <span className={counter.number}>{currentLength}</span>
            <span className={counter.max}>/{maxLength}</span>
          </p>
        )}
        {error && <p className={cn('mt-1 text-xs', TEXT.error)}>{error}</p>}
      </div>
    )
  },
)
TextareaField.displayName = 'TextareaField'

export { TextareaField, type TextareaFieldProps }
