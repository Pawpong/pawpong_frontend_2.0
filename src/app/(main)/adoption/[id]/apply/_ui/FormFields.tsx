import type { ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type UseFormRegisterReturn,
} from 'react-hook-form'
import { CheckboxIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import type { ApplicationFormValues } from '../_lib/schema'

// 라벨 + 필수 뱃지 (Figma 1237-41470) — 라벨 md/bold 14(또는 lg 14→16), 필수 md/medium 14 #6b6b6b
const FieldLabel = ({ title, size = 'md' }: { title: string; size?: 'md' | 'lg' }) => (
  <div className="flex items-center gap-1">
    <span
      className={cn(
        'leading-[1.5] font-semibold text-[#3e3e3e]',
        size === 'lg' ? 'text-sm pc:text-base' : 'text-sm',
      )}
    >
      {title}
    </span>
    <span className="text-sm leading-[1.5] font-medium text-[#6b6b6b]">필수</span>
  </div>
)

// [refactored] 라벨 + 필드 래퍼 — ApplicationForm에서 4회 반복되던 `div(flex-col) + FieldLabel` 패턴 통합
const LabeledField = ({
  title,
  size = 'md',
  gap = 'gap-1',
  children,
}: {
  title: string
  size?: 'md' | 'lg'
  gap?: 'gap-1' | 'gap-5'
  children: ReactNode
}) => (
  <div className={cn('flex flex-col', gap)}>
    <FieldLabel title={title} size={size} />
    {children}
  </div>
)

// 읽기 전용 입력 (입양하는 동물) — border #e4e4e4, h-45, rounded-8, p-12
const ReadonlyInput = ({ value }: { value: string }) => (
  <div className="flex h-[2.8125rem] items-center rounded-lg border border-[#e4e4e4] bg-white p-3">
    <p className="text-sm leading-[1.5] font-medium text-[#3e3e3e]">{value}</p>
  </div>
)

// 텍스트영역 + 글자수 카운터 — border #cacaca, h-105, rounded-8, p-12, placeholder #a6a6a6
const TextareaField = ({
  register,
  value,
  placeholder,
  maxLength = 100,
}: {
  register: UseFormRegisterReturn
  value: string
  placeholder: string
  maxLength?: number
}) => (
  <div className="flex flex-col gap-0.5">
    <textarea
      {...register}
      placeholder={placeholder}
      maxLength={maxLength}
      className="h-[6.5625rem] w-full resize-none rounded-lg border border-[#cacaca] bg-white p-3 text-sm leading-[1.5] font-medium text-[#3e3e3e] placeholder:text-[#a6a6a6] focus:border-[#5d5d5d] focus:outline-none"
    />
    <div className="flex justify-end">
      <span className="text-[0.625rem] leading-[1.5] font-medium text-[#6b6b6b]">
        {value.length}/{maxLength}
      </span>
    </div>
  </div>
)

// 체크박스 — 24px 아이콘(미체크 #cacaca), 라벨 lg/medium 14→16
const CheckboxField = ({
  control,
  name,
  label,
}: {
  control: Control<ApplicationFormValues>
  name: FieldPath<ApplicationFormValues>
  label: string
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className="flex w-full items-center gap-1.5 text-left"
      >
        <CheckboxIcon
          checked={!!field.value}
          className={cn('size-6 shrink-0', field.value ? 'text-[#5d5d5d]' : 'text-[#cacaca]')}
        />
        <span className="flex-1 text-sm leading-[1.5] font-medium text-[#3e3e3e] pc:text-base">
          {label}
        </span>
      </button>
    )}
  />
)

// [refactored] 데스크탑·모바일 CTA의 색/라벨 로직 중복 제거 — 크기만 className으로 주입
const SubmitButton = ({
  isValid,
  isPending,
  className,
}: {
  isValid: boolean
  isPending: boolean
  className?: string
}) => (
  <button
    type="submit"
    disabled={!isValid || isPending}
    className={cn(
      'flex items-center justify-center rounded-full transition-colors',
      isValid && !isPending ? 'bg-[#5d5d5d] text-white' : 'bg-[#d4d4d4] text-[#5d5d5d]',
      className,
    )}
  >
    {isPending ? '제출 중...' : '상담 신청하기'}
  </button>
)

// [refactored] FieldLabel은 LabeledField 내부 전용이 되어 export 제거
export { LabeledField, ReadonlyInput, TextareaField, CheckboxField, SubmitButton }
