'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { Textarea, type TextareaProps } from './Textarea'

interface TextareaFieldProps extends TextareaProps {
  label?: string
  required?: boolean
  error?: string
  currentLength?: number
  wrapperClassName?: string
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    { label, required, error, currentLength, maxLength, wrapperClassName, state, ...props },
    ref,
  ) => {
    const showCounter = maxLength !== undefined && currentLength !== undefined
    const resolvedState = error ? 'error' : state

    return (
      <div className={cn('flex flex-col gap-[0.125rem]', wrapperClassName)}>
        {label && (
          <div className="flex items-center gap-1">
            <span className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              {label}
            </span>
            {required && (
              <span className="p-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#6b6b6b]">
                필수
              </span>
            )}
          </div>
        )}
        <Textarea ref={ref} state={resolvedState} maxLength={maxLength} {...props} />
        {showCounter && (
          <p
            className={cn(
              'text-end text-[0.625rem] leading-[1.5] font-medium',
              resolvedState === 'error' ? 'text-[#d63d4a]' : 'text-[#6b6b6b]',
            )}
          >
            <span className={resolvedState === 'error' ? undefined : 'text-[#6b6b6b]'}>
              {currentLength}
            </span>
            /{maxLength}
          </p>
        )}
        {error && <p className="mt-1 text-xs text-[#d63d4a]">{error}</p>}
      </div>
    )
  },
)
TextareaField.displayName = 'TextareaField'

export { TextareaField, type TextareaFieldProps }
