import type { ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormWatch,
} from 'react-hook-form'
import { Checkbox, TextareaField } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { ApplicationFormValues } from '../_lib/schema'

// [refactored] textarea 글자 수 제한(100)을 공통 컴포넌트 옆으로 이동 (ApplicationForm에서 옮겨옴)
const TEXTAREA_MAX_LENGTH = 100

// [refactored] 스키마에서 문자열 필드 키만 파생 — 필드 추가/삭제 시 자동 반영(drift 방지)
export type ApplicationTextField = {
  [K in keyof ApplicationFormValues]-?: NonNullable<ApplicationFormValues[K]> extends string
    ? K
    : never
}[keyof ApplicationFormValues]

// 라벨 + 필수/선택 뱃지 (Figma 1237-41470) — 라벨 md/bold 14(또는 lg 14→탭+ 16), 뱃지 md/medium 14 #6b6b6b
const FieldLabel = ({
  title,
  size = 'md',
  requirement = '필수',
}: {
  title: string
  size?: 'md' | 'lg'
  requirement?: '필수' | '선택'
}) => (
  <div className="flex items-center gap-1">
    <span
      className={cn(
        'leading-[1.5] font-semibold text-neutral-850',
        size === 'lg' ? 'text-sm tab:text-base' : 'text-sm',
      )}
    >
      {title}
    </span>
    <span className="text-sm leading-[1.5] font-medium text-neutral-700">{requirement}</span>
  </div>
)

// [refactored] 라벨 + 필드 래퍼 — ApplicationForm에서 4회 반복되던 `div(flex-col) + FieldLabel` 패턴 통합
const LabeledField = ({
  title,
  size = 'md',
  gap = 'gap-1',
  requirement = '필수',
  children,
}: {
  title: string
  size?: 'md' | 'lg'
  gap?: 'gap-1' | 'gap-5'
  requirement?: '필수' | '선택'
  children: ReactNode
}) => (
  <div className={cn('flex flex-col', gap)}>
    <FieldLabel title={title} size={size} requirement={requirement} />
    {children}
  </div>
)

// [refactored] LabeledField + TextareaField + 글자 수 카운터 패턴(5회 반복) 통합
const CountedTextareaField = ({
  title,
  placeholder,
  name,
  register,
  watch,
  requirement = '필수',
}: {
  title: string
  placeholder: string
  name: ApplicationTextField
  register: UseFormRegister<ApplicationFormValues>
  watch: UseFormWatch<ApplicationFormValues>
  requirement?: '필수' | '선택'
}) => (
  <LabeledField title={title} requirement={requirement}>
    <TextareaField
      placeholder={placeholder}
      maxLength={TEXTAREA_MAX_LENGTH}
      currentLength={watch(name)?.length ?? 0}
      {...register(name)}
    />
  </LabeledField>
)

// 읽기 전용 입력 (입양하는 동물) — border #e4e4e4, h-45, rounded-8, p-12
const ReadonlyInput = ({ value }: { value: string }) => (
  <div className="flex h-[2.8125rem] items-center rounded-lg border border-neutral-150 bg-white p-3">
    <p className="text-sm leading-[1.5] font-medium text-neutral-850">{value}</p>
  </div>
)

// 체크박스 — 공통 Checkbox(기본 large 24px) + 라벨 lg/medium 14→탭+ 16
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
      // [refactored] 브랜드 스타일이 공통 Checkbox 기본값으로 이동 — 커스텀 className 제거
      <label className="flex w-full cursor-pointer items-center gap-1.5">
        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
        <span className="flex-1 text-sm leading-[1.5] font-medium text-neutral-850 tab:text-base">
          {label}
        </span>
      </label>
    )}
  />
)

// [refactored] CancelButton/SubmitButton 공통 base 클래스 추출 (DRY)
const CTA_BUTTON_BASE =
  'flex items-center justify-center rounded-full font-semibold whitespace-nowrap'

// 신청 취소 버튼 (아웃라인) — 라벨: mo·tab "신청 취소" / pc "신청 취소하기" (Figma 1654-161691/97/03)
const CancelButton = ({ onClick, className }: { onClick: () => void; className?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(CTA_BUTTON_BASE, 'border border-neutral-300 text-neutral-850', className)}
  >
    <span className="pc:hidden">신청 취소</span>
    <span className="hidden pc:inline">신청 취소하기</span>
  </button>
)

// 제출 버튼 (Figma bg/interactive/point-color/primary = point-500) — 라벨: mo "상담 신청하기" / tab "입양 상담" / pc "입양 상담하기", 크기만 className 주입
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
      CTA_BUTTON_BASE,
      'transition-colors',
      isValid && !isPending ? 'bg-point-500 text-neutral-850' : 'bg-[#d4d4d4] text-[#5d5d5d]',
      className,
    )}
  >
    {isPending ? (
      '제출 중...'
    ) : (
      <>
        <span className="tab:hidden">상담 신청하기</span>
        <span className="hidden tab:inline pc:hidden">입양 상담</span>
        <span className="hidden pc:inline">입양 상담하기</span>
      </>
    )}
  </button>
)

// [refactored] 하단 CTA 바 — 스페이서 + 버튼 그룹 레이아웃을 ApplicationForm에서 분리(SRP)
// mo: gap10 px16 py16 / tab·pc: 우측 정렬 그룹(w-360 max-536, 버튼 h-40), px48/80 py12 (Figma 1654-161697)
const FooterCtaBar = ({
  onCancel,
  isValid,
  isPending,
}: {
  onCancel: () => void
  isValid: boolean
  isPending: boolean
}) => (
  <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-2.5 bg-white px-4 py-4 tab:justify-end tab:gap-5 tab:px-12 tab:py-3 pc:px-20">
    {/* 좌측 스페이서 (tab+) */}
    <div className="hidden h-[2.8125rem] flex-1 tab:block" />
    {/* 버튼 그룹 — mo: 전체폭 / tab+: 360px(max-536) */}
    <div className="flex flex-1 items-center gap-2.5 tab:max-w-[33.5rem] tab:flex-none tab:basis-[22.5rem] tab:gap-5">
      <CancelButton
        onClick={onCancel}
        className="h-12 w-[7.3125rem] shrink-0 text-base tab:h-10 tab:w-auto tab:max-w-[16.125rem] tab:flex-1"
      />
      <SubmitButton
        isValid={isValid}
        isPending={isPending}
        className="h-12 max-w-[18.5625rem] flex-1 text-base tab:h-10 tab:max-w-[16.125rem]"
      />
    </div>
  </div>
)

// [refactored] FieldLabel/CancelButton/SubmitButton은 내부 전용이 되어 export 제거 (FooterCtaBar로 통합)
export { LabeledField, CountedTextareaField, ReadonlyInput, CheckboxField, FooterCtaBar }
