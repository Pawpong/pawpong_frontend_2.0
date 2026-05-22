import { LockIcon } from '@/shared/assets/icons'
import type { HomeTabConfig } from './HomeTabs'

const MY_HOME_TABS: HomeTabConfig[] = [
  { id: 'posts', label: '게시글' },
  { id: 'breeders', label: '즐겨찾는 브리더', Icon: LockIcon },
]

const BREEDER_HOME_TABS: HomeTabConfig[] = [
  { id: 'listings', label: '분양목록' },
  { id: 'posts', label: '게시글' },
]

const BREEDER_MY_HOME_TABS: HomeTabConfig[] = [
  { id: 'listings', label: '분양목록' },
  { id: 'posts', label: '게시글' },
  { id: 'breeders', label: '즐겨찾는 브리더', Icon: LockIcon },
]

export { MY_HOME_TABS, BREEDER_HOME_TABS, BREEDER_MY_HOME_TABS }
