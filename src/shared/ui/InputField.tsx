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
    {/* 공통 TextLabel + requirement — Figma label-필수 medium(14) */}
    {label && (
      <TextLabel size="14" requirement={required ? '필수' : undefined}>
        {label}
      </TextLabel>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-[#d63d4a]">{error}</p>}
  </div>
)

export { InputField, type InputFieldProps }
