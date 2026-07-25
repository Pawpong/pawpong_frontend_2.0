export interface NavItem {
  name: string
  href: string
}

// 데스크탑 상단 nav는 shared/config/mainNav(HEADER_NAV)로 통일 (BottomNav와 공유)
export const MOBILE_MENU_ITEMS: NavItem[] = [
  { name: '알림', href: '/notifications' },
  { name: '저장목록', href: '/bookmarks' },
  { name: '설정', href: '/settings' },
]
