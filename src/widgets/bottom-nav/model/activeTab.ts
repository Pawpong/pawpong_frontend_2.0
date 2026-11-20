import { BOTTOM_NAV } from '@/shared/config'

// 남의 홈(/home/{userId})은 어느 탭에도 속하지 않으므로, 들어오기 전 탭에 머문다 (바로 열면 탐색)
// ponytail: 서버에서는 요청끼리 섞이지 않게 기억하지 않는다 — 바로 연 화면은 서버·브라우저 모두 탐색으로 맞는다
let lastHref: string | null = null

export const resolveActiveHref = (pathname: string): string | null => {
  const href = BOTTOM_NAV.find((item) => item.isActive(pathname))?.href ?? null
  if (href) {
    if (typeof window !== 'undefined') lastHref = href
    return href
  }
  return pathname.startsWith('/home/') ? (lastHref ?? '/explore') : null
}
