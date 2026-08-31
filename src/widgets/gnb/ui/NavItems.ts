export interface NavItem {
  name: string
  href: string
}

// 데스크탑 상단 nav는 shared/config/mainNav(HEADER_NAV)로 통일 (BottomNav와 공유)
// 알림은 링크가 아니라 GNB 드롭다운(NotificationBell)으로 별도 렌더한다.
export const MOBILE_PUBLIC_MENU_ITEMS: NavItem[] = [
  { name: '탐색', href: '/explore' },
  { name: '커뮤니티', href: '/community' },
  { name: '명예의 전당', href: '/hall-of-fame' },
  { name: '자주 묻는 질문', href: '/faq' },
]

export const MOBILE_ACCOUNT_MENU_ITEMS: NavItem[] = [
  { name: '알림', href: '/notifications' },
  { name: '저장목록', href: '/bookmarks' },
  { name: '설정', href: '/settings' },
]

export const MOBILE_ADOPTER_ACCOUNT_MENU_ITEMS: NavItem[] = [
  { name: '신청·후기 내역', href: '/activity' },
]
