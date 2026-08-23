'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { SearchIcon } from './SearchIcon'

interface SearchBarProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  /** 초기 입력값 — 탐색 페이지처럼 URL에 검색어가 이미 있는 경우 */
  defaultValue?: string
  /** 제출 시 동작. 미지정이면 탐색 페이지로 이동한다 */
  onSubmit?: (keyword: string) => void
  className?: string
}

const DEFAULT_PLACEHOLDER = {
  mobile: '검색해서 원하는 동물 찾기',
  desktop: '검색해서 원하는 아이 찾기',
}

const INPUT_NAME = 'keyword'

// Figma: tab h48 / PC h56 / rounded8 / border #a6a6a6(포커스 #256EF4 — 모바일·탭 1px / PC 2px) / p12,
// 입력 텍스트 #3E3E3E, placeholder Pretendard medium 16px #a6a6a6, 우측 32px 검색 아이콘
export const SearchBar = ({
  placeholder = DEFAULT_PLACEHOLDER,
  defaultValue,
  onSubmit,
  className,
}: SearchBarProps) => {
  const isTablet = useBreakpoint('tab')
  const router = useRouter()

  // 비제어 입력 + form submit — Enter와 아이콘 클릭이 같은 경로를 타고,
  // 페이지마다 검색어 state를 따로 들 필요가 없다
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = new FormData(event.currentTarget).get(INPUT_NAME)?.toString().trim() ?? ''

    if (onSubmit) {
      onSubmit(keyword)
      return
    }
    router.push(keyword ? `/explore?keyword=${encodeURIComponent(keyword)}` : '/explore')
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'flex h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-500 bg-white p-3 focus-within:border-info-500 pc:h-14 pc:focus-within:border-2',
        className,
      )}
    >
      <input
        type="text"
        name={INPUT_NAME}
        defaultValue={defaultValue}
        placeholder={isTablet ? placeholder.desktop : placeholder.mobile}
        className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
      />
      <button type="submit" aria-label="검색" className="shrink-0">
        <SearchIcon className="size-8 text-neutral-700" />
      </button>
    </form>
  )
}
