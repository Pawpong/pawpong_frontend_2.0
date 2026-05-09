export interface NavItem {
  name: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { name: '마이홈', href: '/home' },
  { name: '채팅', href: '/chat' },
  { name: '알림', href: '/notifications' },
]
