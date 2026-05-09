'use client';

import { useEffect, useState } from 'react';

const BREAKPOINTS = {
  mo: 375,
  tab: 768,
  pc: 1440,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * 현재 뷰포트가 지정한 브레이크포인트 이상인지 반환
 * @example
 * const isTablet = useBreakpoint('tab');  // 768px 이상이면 true
 * const isPC = useBreakpoint('pc');       // 1440px 이상이면 true
 */
const useBreakpoint = (breakpoint: Breakpoint) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    setMatches(query.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
};

export { useBreakpoint };
