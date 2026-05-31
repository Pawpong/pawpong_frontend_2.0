import * as React from 'react'
import { cn } from '@/shared/lib/cn'

interface InputFieldProps {
  label?: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

const InputField = ({ label, required, error, className, children }: InputFieldProps) => (
  <div className={cn('flex flex-col', className)}>
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
    {children}
    {error && <p className="mt-1 text-xs text-[#d63d4a]">{error}</p>}
  </div>
)

export { InputField, type InputFieldProps }
