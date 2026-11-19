// 하단 네비를 노출할 화면. 전체 메뉴로 들어가는 화면들도 포함해, 메뉴를 거쳐 온 뒤에도
// 탐색·커뮤니티·마이홈으로 돌아갈 진입점이 사라지지 않게 한다.
const BOTTOM_NAV_PATHS = new Set([
  '/',
  '/explore',
  '/chat',
  '/community',
  '/ai-filter',
  '/playground',
  '/care-map',
  '/home',
  '/settings',
  '/activity',
  '/bookmarks',
  '/notifications',
  '/notices',
  '/hall-of-fame',
  '/faq',
  '/about',
  '/drafts',
])

// 목록에서 들어간 상세도 같은 네비를 유지한다
const BOTTOM_NAV_PREFIXES = ['/activity/', '/notices/', '/home/']

// 자체 하단 고정 바(FooterCtaBar·AdoptionCtaBar)가 있는 작성·편집·신청 화면은 겹치므로 제외한다
const BOTTOM_NAV_EXCLUDED = /\/(write|edit|apply|create|participate)$/

/** 웹 하단바와 앱 탭 바(NativeTabSync)가 같은 기준으로 보이고 숨는다 */
export const shouldShowBottomNav = (pathname: string) =>
  !BOTTOM_NAV_EXCLUDED.test(pathname) &&
  (BOTTOM_NAV_PATHS.has(pathname) ||
    BOTTOM_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix)))
