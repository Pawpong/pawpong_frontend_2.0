export interface NavItem {
  name: string
  href: string
  /** 로그인해야 열리는 화면 — 비로그인은 숨기지 않고 로그인으로 보낸다 */
  requiresAuth?: boolean
}

// 데스크탑 상단 nav는 shared/config/mainNav(HEADER_NAV)로 통일 (BottomNav와 공유)
//
// 전체 메뉴는 Figma 'haeder menu'(3555:416834) 의 문구와 순서를 그대로 따른다.
// '등급 정책'만 제외한다 — 2026-08-31 정책으로 제거된 화면이라 /grade-policy 는 notFound 다.
//
// 항목은 로그인 여부·역할과 무관하게 전부 노출하고, 비로그인은 returnUrl 을 실어 로그인으로 보낸다.
export const MOBILE_MENU_ITEMS: NavItem[] = [
  { name: '알림', href: '/notifications', requiresAuth: true },
  { name: '입양 신청서', href: '/activity', requiresAuth: true },
  // Figma 목록에는 없지만 이 메뉴가 유일한 진입로라 유지한다
  { name: '저장목록', href: '/bookmarks', requiresAuth: true },
  { name: '명예의 전당', href: '/hall-of-fame' },
  { name: '서비스 소개', href: '/about' },
  { name: '자주 묻는 질문', href: '/faq' },
  { name: '공지사항', href: '/notices' },
  { name: '설정', href: '/settings', requiresAuth: true },
]
