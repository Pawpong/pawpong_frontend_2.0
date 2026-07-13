export interface NavItem {
  name: string
  href: string
}

// 알림은 링크가 아니라 GNB 드롭다운(NotificationBell)으로 별도 렌더한다.
export const NAV_ITEMS: NavItem[] = [
  { name: '마이홈', href: '/home' },
  { name: '채팅', href: '/chat' },
]

export const MOBILE_MENU_ITEMS: NavItem[] = [
  { name: '알림', href: '/notifications' },
  { name: '저장목록', href: '/bookmarks' },
  { name: '설정', href: '/settings' },
]
