'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { popularKeywordQueries } from '@/entities/popular-keyword'
import { Chip } from '@/shared/ui'

interface PopularKeywordsProps {
  /** 칩 클릭 동작. 미지정이면 탐색 페이지로 이동한다 */
  onSelect?: (keyword: string) => void
}

/** 검색바 아래 인기 검색어 칩 (Figma 2752-261253) — 누르면 그 키워드로 검색한다 */
const PopularKeywords = ({ onSelect }: PopularKeywordsProps) => {
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
    router.push(`/explore?type=adoption&keyword=${encodeURIComponent(keyword)}`)
  }

  return (
    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
      <span className="shrink-0 text-xs leading-[1.5] font-medium text-neutral-700 tab:text-sm">
        인기 검색어
      </span>
      <div className="flex min-w-max items-center gap-1 tab:gap-2">
        {keywords.map(({ keywordId, keyword }) => (
          <Chip size="responsive" key={keywordId} onClick={() => select(keyword)}>
            {keyword}
          </Chip>
        ))}
      </div>
    </div>
  )
}

export { PopularKeywords }
