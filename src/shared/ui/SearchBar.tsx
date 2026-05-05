'use client'

import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const searchBarVariants = tv({
  base: 'flex items-center justify-between border border-[#a8a8a8] rounded-full px-[1.75rem] py-[0.75rem] w-full',
})

type SearchBarProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  className?: string
} & VariantProps<typeof searchBarVariants>

export const SearchBar = ({
  placeholder = '아무거나 검색해보세요',
  value,
  onChange,
  onSearch,
  className,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = React.useState('')
  const query = value ?? internalValue
  const setQuery = onChange ?? setInternalValue

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch?.(query.trim())
    }
  }

  return (
    <div className={cn(searchBarVariants(), className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[0.875rem] leading-[1.375rem] font-semibold text-[#5d5d5d] outline-none placeholder:text-[#a8a8a8]"
      />
      <button
        onClick={() => query.trim() && onSearch?.(query.trim())}
        className="flex size-[2rem] shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] transition-colors hover:bg-[#c6c6c6]"
        aria-label="검색"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#5d5d5d" strokeWidth="1.5" />
          <path d="M9.5 9.5L13 13" stroke="#5d5d5d" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
