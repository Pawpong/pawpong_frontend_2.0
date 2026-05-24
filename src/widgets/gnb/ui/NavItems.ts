export interface NavItem {
  name: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { name: '마이홈', href: '/home' },
  { name: '채팅', href: '/chat' },
  { name: '알림', href: '/notifications' },
]

export const MOBILE_MENU_ITEMS: NavItem[] = [
  { name: '알림', href: '/notifications' },
  { name: '저장목록', href: '/bookmarks' },
  { name: '설정', href: '/settings' },
]
