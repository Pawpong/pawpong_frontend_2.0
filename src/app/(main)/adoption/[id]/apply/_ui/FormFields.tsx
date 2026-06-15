import type { ReactNode } from 'react'
import { Controller, type Control, type FieldPath } from 'react-hook-form'
import { Checkbox } from '@/shared/ui'
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

// 체크박스 — 공통 Checkbox(기본 large 24px) + 라벨 lg/medium 14→16
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
        <span className="flex-1 text-sm leading-[1.5] font-medium text-[#3e3e3e] pc:text-base">
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
    className={cn(CTA_BUTTON_BASE, 'border border-[#cacaca] text-[#3e3e3e]', className)}
  >
    <span className="pc:hidden">신청 취소</span>
    <span className="hidden pc:inline">신청 취소하기</span>
  </button>
)

// 제출 버튼 (노랑 #fffa94) — 라벨: mo "상담 신청하기" / tab "입양 상담" / pc "입양 상담하기", 크기만 className 주입
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
      isValid && !isPending ? 'bg-[#fffa94] text-[#3e3e3e]' : 'bg-[#d4d4d4] text-[#5d5d5d]',
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
// mo: gap10 px16 py16 / tab·pc: 우측 정렬 그룹(w-360 max-536), px48/80 py12 (Figma 1654-161691/97/03)
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
        className="h-12 w-[7.3125rem] shrink-0 text-base tab:h-8 tab:w-auto tab:max-w-[16.125rem] tab:flex-1 tab:text-sm"
      />
      <SubmitButton
        isValid={isValid}
        isPending={isPending}
        className="h-12 max-w-[18.5625rem] flex-1 text-base tab:h-8 tab:max-w-[16.125rem] tab:text-sm"
      />
    </div>
  </div>
)

// [refactored] FieldLabel/CancelButton/SubmitButton은 내부 전용이 되어 export 제거 (FooterCtaBar로 통합)
export { LabeledField, ReadonlyInput, CheckboxField, FooterCtaBar }
