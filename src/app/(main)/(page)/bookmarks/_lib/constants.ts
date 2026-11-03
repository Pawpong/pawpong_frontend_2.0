import type { TabBarItem } from '@/shared/ui'

export const BOOKMARK_TABS = [
  { value: 'favorites', label: '입양 관심' },
  { value: 'adoption-list', label: '입양목록' },
  { value: 'breeders', label: '즐겨찾는 브리더' },
] as const satisfies readonly TabBarItem[]
