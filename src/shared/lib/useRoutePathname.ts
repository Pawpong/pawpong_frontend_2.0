'use client'

import { usePathname } from 'next/navigation'

/**
 * usePathname 과 같지만 홈 경로를 '/' 로 맞춘다.
 *
 * Vercel 이 홈('/')을 ISR 로 다시 만들 때 서버 렌더의 경로가 '/index' 로 들어온다(로컬 next start 는 '/').
 * 그대로 쓰면 경로로 켜고 끄는 푸터·하단 탭이 서버 HTML 에서 빠져 브라우저 결과와 어긋나고,
 * 하이드레이션이 깨진 React 가 화면 전체를 다시 그리며 <html data-app> 까지 지운다.
 * 경로로 무엇을 그릴지 정하는 공통 레이아웃 컴포넌트는 이 훅을 쓴다.
 */
export const useRoutePathname = (): string => {
  const pathname = usePathname()
  return pathname === '/index' ? '/' : pathname
}
