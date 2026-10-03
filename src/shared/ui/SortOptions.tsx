'use client'

import { cn } from '@/shared/lib/cn'

interface SortOptionsProps<Value extends string> {
  options: ReadonlyArray<{ value: Value; label: string }>
  value: Value
  onValueChange: (value: Value) => void
  ariaLabel: string
  compact?: boolean
}

/** 목록 정렬 선택 — 커뮤니티와 마이홈이 같은 텍스트 버튼 규격을 사용한다. */
const SortOptions = <Value extends string>({
  options,
  value,
  onValueChange,
  ariaLabel,
  compact = false,
}: SortOptionsProps<Value>) => (
  <div role="group" aria-label={ariaLabel} className="flex shrink-0 items-center gap-3">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onValueChange(option.value)}
        className={cn(
          'min-h-10 rounded px-1 whitespace-nowrap focus-ring',
          compact ? 'text-xs' : 'text-sm',
          value === option.value
            ? compact
              ? 'font-medium text-neutral-700'
              : 'font-semibold text-neutral-850'
            : 'text-neutral-500 hover:text-neutral-850',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
)

export { SortOptions }
