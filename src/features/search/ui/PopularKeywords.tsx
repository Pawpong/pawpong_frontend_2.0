'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { popularKeywordQueries } from '@/entities/popular-keyword'

/** 검색바 아래 인기 검색어 칩 (Figma 2752-261253) — 누르면 해당 키워드로 탐색한다 */
const PopularKeywords = () => {
  const router = useRouter()
  // 홈의 보조 정보라 실패해도 페이지는 렌더되어야 한다
  const { data } = useQuery({ ...popularKeywordQueries.list(), throwOnError: false })

  const keywords = data ?? []
  if (keywords.length === 0) return null

  return (
    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
      <span className="shrink-0 text-xs leading-[1.5] font-medium text-neutral-700 tab:text-sm">
        인기 검색어
      </span>
      <div className="flex min-w-max items-center gap-1 tab:gap-2">
        {keywords.map(({ keywordId, keyword }) => (
          <button
            key={keywordId}
            type="button"
            onClick={() => router.push(`/explore?keyword=${encodeURIComponent(keyword)}`)}
            className="flex h-6 items-center rounded-full border border-primary-500 px-2 text-[0.625rem] leading-[1.5] font-medium whitespace-nowrap text-primary-500 tab:h-auto tab:py-0.5 tab:text-sm"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  )
}

export { PopularKeywords }
