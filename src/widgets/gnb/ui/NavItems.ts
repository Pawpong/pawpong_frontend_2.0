export interface NavItem {
  name: string
  href: string
  /** 로그인해야 열리는 화면 — 비로그인은 숨기지 않고 로그인으로 보낸다 */
  requiresAuth?: boolean
}

// 데스크탑 상단 nav는 shared/config/mainNav(HEADER_NAV)로 통일 (BottomNav와 공유)
//
// 전체 메뉴 순서: 내 것(관심 → 신청, 입양 흐름 순) → 둘러보기 → 소식 → 설정(맨 끝).
// 문구는 마이홈 사이드 링크·각 페이지 제목과 같게 둔다.
// '등급 정책'은 2026-08-31 정책으로 /grade-policy 라우트 자체를 제거했다.
// '서비스 소개'·'자주 묻는 질문'은 2026-09-14 부터 푸터(SiteFooter)로 이동.
//
// 항목은 로그인 여부·역할과 무관하게 전부 노출하고, 비로그인은 returnUrl 을 실어 로그인으로 보낸다.
export const MOBILE_MENU_ITEMS: NavItem[] = [
  { name: '관심 목록', href: '/bookmarks', requiresAuth: true },
  { name: '신청·후기', href: '/activity', requiresAuth: true },
  { name: '우리 동네 돌봄 지도', href: '/care-map' },
  { name: '명예의 전당', href: '/hall-of-fame' },
  { name: '공지사항', href: '/notices' },
  { name: '설정', href: '/settings', requiresAuth: true },
]
