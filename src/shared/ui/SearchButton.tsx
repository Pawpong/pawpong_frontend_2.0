'use client'

import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { SearchIcon } from './SearchIcon'

// Figma 1652-72893 search-btn
// default: 컴팩트 트리거(내용 너비, 회색) / active: 눌렀을 때 확장 입력(최대 300px, 파란 테두리)
const pill = tv({
  base: 'flex h-8 items-center gap-1 rounded-full border bg-white px-3 py-2 whitespace-nowrap',
  variants: {
    active: {
      false: 'w-auto justify-center border-[#a6a6a6]',
      true: 'w-full max-w-[18.75rem] justify-between border-[#256ef4]',
    },
  },
  defaultVariants: { active: false },
})

interface SearchButtonProps {
  /** true면 focus 상태의 입력 pill, false면 검색 트리거 버튼 */
  active?: boolean
  value?: string
  onChange?: (value: string) => void
  onClick?: () => void
  onSubmit?: () => void
  onBlur?: () => void
  className?: string
}

/** 알약형 "검색" 버튼 (Figma search-btn) — 트리거(회색) / focus 입력(파란 테두리) 겸용 */
const SearchButton = ({
  active = false,
  value,
  onChange,
  onClick,
  onSubmit,
  onBlur,
  className,
}: SearchButtonProps) => {
  if (active) {
    return (
      <div className={cn(pill({ active: true }), className)}>
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
          onBlur={onBlur}
          placeholder="검색"
          className="min-w-0 flex-1 bg-transparent text-sm leading-[1.5] font-semibold text-[#3e3e3e] outline-none placeholder:text-[#6b6b6b]"
        />
        <button type="button" onClick={() => onSubmit?.()} aria-label="검색">
          <SearchIcon className="size-5 shrink-0 text-[#6b6b6b]" />
        </button>
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cn(pill({ active: false }), className)}>
      <span className="text-sm leading-[1.5] font-semibold text-[#a6a6a6]">검색</span>
      <SearchIcon className="size-5 shrink-0 text-[#a6a6a6]" />
    </button>
  )
}

export { SearchButton }
