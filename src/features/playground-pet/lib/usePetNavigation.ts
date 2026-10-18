'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  normalizePetSourceJobId,
  petPageHref,
  petTabFromSearch,
  type PetTab,
} from '@/entities/playground-pet'

function replacePetLocation(tab: PetTab, sourceJobId?: string) {
  if (window.location.pathname !== '/playground/pet') return
  const href = petPageHref({ tab, sourceJobId })
  if (`${window.location.pathname}${window.location.search}` !== href)
    window.history.replaceState(null, '', href)
}

/** 탭 선택은 현재 기록만 갱신해 뒤로가기를 늘리지 않고 재방문과 로그인 복귀에 유지한다. */
export function usePetNavigation(activeGameId?: string | null) {
  const params = useSearchParams()
  const tab = petTabFromSearch(params.get('tab'))
  const sourceJobId = normalizePetSourceJobId(params.get('sourceJobId'))
  useEffect(() => {
    if (activeGameId && tab !== 'games') replacePetLocation('games', sourceJobId)
  }, [activeGameId, tab, sourceJobId])
  return {
    tab: activeGameId ? ('games' as const) : tab,
    sourceJobId,
    href: petPageHref({ tab, sourceJobId }),
    selectTab: (next: PetTab) => {
      if (!activeGameId || next === 'games') replacePetLocation(next, sourceJobId)
    },
    clearSource: () => replacePetLocation(tab, undefined),
  }
}
