'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { popularKeywordQueries } from '@/entities/popular-keyword'
import { cn } from '@/shared/lib/cn'

//QA: 홈 인기 검색어 스타일 — Figma 간격/칩 높이를 적용하고 Explore 기본 스타일은 유지한다.
interface PopularKeywordsProps {
  variant?: 'default' | 'home'
  /** 칩 클릭 동작. 미지정이면 탐색 페이지로 이동한다 */
  onSelect?: (keyword: string) => void
}

/** 검색바 아래 인기 검색어 칩 (Figma 2752-261253) — 누르면 그 키워드로 검색한다 */
const PopularKeywords = ({ variant = 'default', onSelect }: PopularKeywordsProps) => {
  const router = useRouter()
  // 검색바의 보조 정보라 실패해도 페이지는 렌더되어야 한다
  const { data } = useQuery({ ...popularKeywordQueries.list(), throwOnError: false })

  const keywords = data ?? []
  if (keywords.length === 0) return null

  const select = (keyword: string) => {
    if (onSelect) {
      onSelect(keyword)
      return
    }
    router.push(`/explore?keyword=${encodeURIComponent(keyword)}`)
  }

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3 overflow-hidden',
        variant === 'home' && 'pc:gap-5',
      )}
    >
      <span className="shrink-0 text-xs leading-[1.5] font-medium text-neutral-700 tab:text-sm">
        인기 검색어
      </span>
      <div className="flex min-w-max items-center gap-1 tab:gap-2">
        {keywords.map(({ keywordId, keyword }) => (
          <button
            key={keywordId}
            type="button"
            onClick={() => select(keyword)}
            className={cn(
              'flex h-6 items-center rounded-full border border-primary-500 px-2 text-[0.625rem] leading-[1.5] font-medium whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-50 tab:h-auto tab:py-0.5 tab:text-sm',
              variant === 'home' && 'tab:py-1',
            )}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  )
}

export { PopularKeywords }
