'use client'

import { useCallback, useSyncExternalStore } from 'react'

const BREAKPOINTS = {
  mo: 375,
  tab: 768,
  pc: 1440,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 현재 뷰포트가 지정한 브레이크포인트 이상인지 반환
 * @example
 * const isTablet = useBreakpoint('tab');  // 768px 이상이면 true
 * const isPC = useBreakpoint('pc');       // 1440px 이상이면 true
 */
const useBreakpoint = (breakpoint: Breakpoint) => {
  const mediaQuery = `(min-width: ${BREAKPOINTS[breakpoint]}px)`

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const query = window.matchMedia(mediaQuery)
      query.addEventListener('change', onStoreChange)
      return () => query.removeEventListener('change', onStoreChange)
    },
    [mediaQuery],
  )

  const getSnapshot = useCallback(() => window.matchMedia(mediaQuery).matches, [mediaQuery])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export { useBreakpoint }
