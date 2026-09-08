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

//QA: 검색 동작 공통화 — Enter와 아이콘 클릭이 같은 form submit/router 동작을 탄다.
export const SearchBar = ({ placeholder, defaultValue, onSubmit, className }: SearchBarProps) => {
  const isTablet = useBreakpoint('tab')
  const router = useRouter()
  const resolvedPlaceholder = placeholder ?? DEFAULT_PLACEHOLDER

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
        'group flex h-12 w-full items-center gap-2 rounded-full border border-neutral-300 bg-white py-1 pr-1.5 pl-5 pc:h-14 pc:pl-6',
        'transition-[border-color,box-shadow] duration-150',
        // 포커스: 브랜드 테두리 + 옐로우 글로우 (파란 시스템 색은 쓰지 않는다)
        'focus-within:border-primary-500 focus-within:shadow-[0_0_0_0.25rem_rgba(255,254,114,0.45)]',
        className,
      )}
    >
      <input
        type="text"
        name={INPUT_NAME}
        defaultValue={defaultValue}
        placeholder={isTablet ? resolvedPlaceholder.desktop : resolvedPlaceholder.mobile}
        className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
      />
      <button
        type="submit"
        aria-label="검색"
        //QA: 검색 아이콘 상태 — 평소에는 회색, 포커스 시 브랜드 색으로 함께 바뀐다.
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-700 pc:size-11',
          'transition-colors group-focus-within:text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        )}
      >
        <SearchIcon className="size-7 pc:size-8" />
      </button>
    </form>
  )
}
