import { SearchIcon } from '@/shared/ui'
import type { HomeTabConfig } from './HomeTabs'

// [refactored] 탭 항목 단일 출처 — 여러 탭셋에서 공유하는 항목 중복 제거
// (라벨·아이콘 변경 시 한 곳만 고치면 됨. posts는 공개/마이홈에서 라벨이 달라 분리)
const HOME_TAB = {
  listings: { id: 'listings', label: '분양 목록' },
  publicListings: { id: 'listings', label: '분양 목록', mobileLabel: '분양목록' },
  posts: { id: 'posts', label: '게시글' },
  feed: { id: 'posts', label: '피드' },
  myPosts: { id: 'posts', label: '내가 쓴 글' },
  favoriteBreeders: { id: 'breeders', label: '즐겨찾는 브리더', Icon: SearchIcon },
  receivedApplications: { id: 'applications', label: '받은 신청' },
} satisfies Record<string, HomeTabConfig>

// [refactored] 배열은 항목 조합만 담당
const MY_HOME_TABS: HomeTabConfig[] = [HOME_TAB.myPosts, HOME_TAB.favoriteBreeders]

const BREEDER_HOME_TABS: HomeTabConfig[] = [HOME_TAB.publicListings, HOME_TAB.feed]

// 브리더 마이홈은 시안(3170-825849)이 '게시글' 표기 — 입양자 마이홈의 '내가 쓴 글'과 다르다
const BREEDER_MY_HOME_TABS: HomeTabConfig[] = [
  HOME_TAB.listings,
  HOME_TAB.posts,
  HOME_TAB.receivedApplications,
  HOME_TAB.favoriteBreeders,
]

export { MY_HOME_TABS, BREEDER_HOME_TABS, BREEDER_MY_HOME_TABS }
