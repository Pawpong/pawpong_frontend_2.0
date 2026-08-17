import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { TextLabel } from './TextLabel'

interface InputFieldProps {
  label?: string
  required?: boolean
  /** 칩을 직접 지정 (미지정 시 required 로 결정) — '선택' 칩이 필요한 폼용 */
  requirement?: '필수' | '선택'
  error?: string
  className?: string
  children: React.ReactNode
}

const InputField = ({
  label,
  required,
  requirement,
  error,
  className,
  children,
}: InputFieldProps) => (
  <div className={cn('flex flex-col', className)}>
    {/* 공통 TextLabel + requirement — Figma label-필수 medium(14) */}
    {label && (
      <TextLabel size="14" requirement={requirement ?? (required ? '필수' : undefined)}>
        {label}
      </TextLabel>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
  </div>
)

export { InputField, type InputFieldProps }
