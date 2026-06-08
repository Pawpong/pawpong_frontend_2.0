'use client'

import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { SearchIcon } from './SearchIcon'

interface SearchBarProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  className?: string
}

const DEFAULT_PLACEHOLDER = {
  mobile: '검색해서 원하는 동물 찾기',
  desktop: '검색해서 원하는 아이 찾기',
}

// Figma: h56 / rounded8 / border #a6a6a6(포커스 #256EF4 — 모바일·탭 1px / PC 2px) / p12,
// 입력 텍스트 #3E3E3E, placeholder Pretendard medium 16px #a6a6a6, 우측 32px 검색 아이콘
export const SearchBar = ({ placeholder = DEFAULT_PLACEHOLDER, className }: SearchBarProps) => {
  const isTablet = useBreakpoint('tab')

  return (
    <div
      className={cn(
        'flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-[#a6a6a6] bg-white p-3 focus-within:border-[#256ef4] pc:focus-within:border-2',
        className,
      )}
    >
      <input
        type="text"
        placeholder={isTablet ? placeholder.desktop : placeholder.mobile}
        className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6]"
      />
      <SearchIcon className="size-8 shrink-0 text-[#6b6b6b]" />
    </div>
  )
}
