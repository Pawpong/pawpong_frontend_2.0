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

// 홈 전반의 웜 뉴트럴 + 브라운 포인트 톤을 공유한다.
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
        'group flex h-12 w-full items-center justify-between gap-3 rounded-full border border-primary-200 bg-primary-50/40 px-4 shadow-[0_3px_12px_rgba(73,45,20,0.06)] transition-[border-color,background-color,box-shadow] focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_5px_18px_rgba(173,101,29,0.12)] pc:h-14 pc:px-5',
        className,
      )}
    >
      <input
        type="text"
        name={INPUT_NAME}
        defaultValue={defaultValue}
        placeholder={isTablet ? placeholder.desktop : placeholder.mobile}
        className="min-w-0 flex-1 bg-transparent text-sm leading-[1.5] font-medium text-neutral-850 outline-none placeholder:font-normal placeholder:text-neutral-500 tab:text-base"
      />
      <button
        type="submit"
        aria-label="검색"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 pc:size-9"
      >
        <SearchIcon className="size-5 pc:size-6" />
      </button>
    </form>
  )
}
