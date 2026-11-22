'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ANIMAL_CATEGORIES } from '@/shared/types'
import type { AdoptionSortType, AnimalCategory } from '@/shared/types'
import { ALL_REGIONS } from './constants'
import type { ExploreStatus, ExploreType } from './constants'

export interface ExploreQuery {
  type: ExploreType
  category: AnimalCategory
  status: ExploreStatus
  sort: AdoptionSortType
  /** 'all' 이면 지역 미선택 (브리더 탐색 전용) */
  region: string
  keyword: string
}

const DEFAULT_QUERY: ExploreQuery = {
  type: 'breeder',
  category: 'all',
  status: 'all',
  sort: 'popular',
  region: ALL_REGIONS,
  keyword: '',
}

const parseQuery = (params: URLSearchParams): ExploreQuery => {
  const type: ExploreType = params.get('type') === 'adoption' ? 'adoption' : 'breeder'
  const category = params.get('category') as AnimalCategory | null
  const status = params.get('status')
  return {
    type,
    category: category && ANIMAL_CATEGORIES.includes(category) ? category : 'all',
    // 예약중은 입양 탐색에만 있다
    status:
      status === 'available' || (status === 'reserved' && type === 'adoption') ? status : 'all',
    sort: params.get('sort') === 'latest' ? 'latest' : 'popular',
    region: (type === 'breeder' && params.get('region')) || ALL_REGIONS,
    keyword: params.get('keyword') ?? '',
  }
}

/** 결과를 실제로 줄이는 조건이 하나라도 걸렸는가 (정렬은 순서만 바꾸므로 제외) */
export const hasNarrowedQuery = (query: ExploreQuery) =>
  query.category !== 'all' ||
  query.status !== 'all' ||
  query.region !== ALL_REGIONS ||
  query.keyword !== ''

/**
 * 탐색 조회 조건은 URL 이 단일 출처다 — 뒤로가기·새로고침·공유가 같은 화면을 복원한다.
 * 정적 프리렌더된 이 페이지에서 searchParams 만 바꾸는 router.push/replace 는 프로덕션에서
 * 현재 URL 로 되돌려지므로, Next 가 지원하는 네이티브 history API 를 쓴다 (useSearchParams 가 따라온다).
 * 조건 변경은 push(뒤로가기 = 직전 조건), 초기화만 replace.
 */
export const useExploreQuery = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const query = useMemo(() => parseQuery(searchParams), [searchParams])

  const setQuery = useCallback(
    (patch: Partial<ExploreQuery>, options: { replace?: boolean } = {}) => {
      const next = { ...query, ...patch }
      // utm 같은 다른 파라미터는 남기고, 기본값인 조건은 지워 URL 을 짧게 둔다
      const params = new URLSearchParams(searchParams.toString())
      const entries: Array<[keyof ExploreQuery, string]> = [
        ['type', next.type],
        ['category', next.category],
        ['status', next.status],
        ['sort', next.sort],
        ['region', next.region],
        ['keyword', next.keyword.trim()],
      ]
      for (const [key, value] of entries) {
        if (!value || value === DEFAULT_QUERY[key]) params.delete(key)
        else params.set(key, value)
      }
      const search = params.toString()
      const href = search ? `${pathname}?${search}` : pathname
      if (options.replace) window.history.replaceState(null, '', href)
      else window.history.pushState(null, '', href)
    },
    [pathname, query, searchParams],
  )

  return { query, setQuery }
}
