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

// Figma search/input(743:69763): 40px, neutral border, radius 8.
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
        'group flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-neutral-500 bg-white px-3 transition-colors focus-within:border-info-500 pc:focus-within:border-2',
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
      <button
        type="submit"
        aria-label="검색"
        className="flex size-8 shrink-0 items-center justify-center rounded text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <SearchIcon className="size-8" />
      </button>
    </form>
  )
}
