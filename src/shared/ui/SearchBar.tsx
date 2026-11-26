'use client'

import type { Ref } from 'react'
import { CloseIcon } from '@/shared/assets'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { SearchIcon } from './SearchIcon'
import { IconButton } from './IconButton'

interface SearchBarProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  /** 초기 입력값 — 탐색 페이지처럼 URL에 검색어가 이미 있는 경우 */
  defaultValue?: string
  value?: string
  inputRef?: Ref<HTMLInputElement>
  onEscape?: () => void
  onClear?: () => void
  maxLength?: number
  /** 제출 시 동작. 미지정이면 탐색 페이지로 이동한다 */
  onSubmit?: (keyword: string) => void
  /** 타이핑마다 실시간으로 필요한 화면(채팅 목록 필터 등)에서만 넘긴다 */
  onChange?: (keyword: string) => void
  /**
   * outline: 흰 바탕 + 테두리 알약 (홈의 큰 검색)
   * soft: 흰 바탕 + 옅은 테두리(Input 과 같은 색), 돋보기를 앞에 둔 38px 슬림 검색 (채팅·헤더 공통 기본)
   */
  appearance?: 'outline' | 'soft'
  className?: string
}

const DEFAULT_PLACEHOLDER = {
  mobile: '검색해서 원하는 동물 찾기',
  desktop: '검색해서 원하는 아이 찾기',
}

const INPUT_NAME = 'keyword'

//QA: 검색 동작 공통화 — Enter와 아이콘 클릭이 같은 form submit/router 동작을 탄다.
export const SearchBar = ({
  placeholder,
  defaultValue,
  value,
  inputRef,
  onEscape,
  onClear,
  maxLength,
  onSubmit,
  onChange,
  appearance = 'soft',
  className,
}: SearchBarProps) => {
  const isTablet = useBreakpoint('tab')
  const isSoft = appearance === 'soft'
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
    router.push(
      keyword
        ? `/explore?type=adoption&keyword=${encodeURIComponent(keyword)}`
        : '/explore?type=adoption',
    )
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'group flex w-full flex-row-reverse items-center gap-2 border transition-[border-color,box-shadow] duration-150',
        isSoft
          ? // 돋보기(제출 버튼)를 앞에 두려고 순서만 뒤집는다. 포커스는 테두리만 브랜드 색으로
            'h-[2.375rem] rounded-[0.6875rem] border-neutral-150 bg-white pr-3 pl-1 focus-within:border-primary-500'
          : // 포커스: 브랜드 테두리 + 옐로우 글로우 (파란 시스템 색은 쓰지 않는다)
            'h-11 rounded-full border-neutral-300 bg-white py-1 pr-4 pl-1 focus-within:border-primary-500 focus-within:shadow-[0_0_0_0.25rem_rgba(255,254,114,0.45)] tab:h-12 tab:pr-5 tab:pl-1.5 pc:h-14 pc:pr-6',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onEscape?.()
        }}
        name={INPUT_NAME}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-label={resolvedPlaceholder.desktop}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={isTablet ? resolvedPlaceholder.desktop : resolvedPlaceholder.mobile}
        className={cn(
          'min-w-0 flex-1 bg-transparent font-medium text-neutral-850 outline-none placeholder:text-neutral-500',
          isSoft
            ? 'text-sm leading-[1.5]'
            : 'text-base leading-[1.5] placeholder:text-sm tab:placeholder:text-base',
        )}
      />
      {onClear && value && (
        <span className="order-first">
          <IconButton
            tone="muted"
            size="xs"
            shape="circle"
            type="button"
            aria-label="검색어 지우기"
            onClick={onClear}
          >
            <CloseIcon className="size-3.5" />
          </IconButton>
        </span>
      )}
      <IconButton
        tone="muted"
        size={isSoft ? 'xs' : 'sm'}
        type="submit"
        // 헤더의 검색 열기 돋보기("검색")와 구분되는 이름
        aria-label="검색하기"
        //QA: 검색 아이콘 상태 — 평소에는 회색, 포커스 시 브랜드 색으로 함께 바뀐다.
      >
        <SearchIcon className={isSoft ? 'size-5' : 'size-6 tab:size-7 pc:size-8'} />
      </IconButton>
    </form>
  )
}
