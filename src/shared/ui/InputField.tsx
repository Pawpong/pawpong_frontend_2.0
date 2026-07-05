import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { TextLabel } from './TextLabel'

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
        {/* 공통 TextLabel — Figma Label 14 bold/medium */}
        <TextLabel size="14">{label}</TextLabel>
        {required && (
          <TextLabel size="14" weight="medium" color="secondary">
            필수
          </TextLabel>
        )}
      </div>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-[#d63d4a]">{error}</p>}
  </div>
)

export { InputField, type InputFieldProps }
