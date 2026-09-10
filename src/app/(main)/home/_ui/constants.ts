import { SearchIcon } from '@/shared/ui'
import type { HomeTabConfig } from './HomeTabs'

// [refactored] 탭 항목 단일 출처 — 여러 탭셋에서 공유하는 항목 중복 제거
// (라벨·아이콘 변경 시 한 곳만 고치면 됨. posts는 공개/마이홈에서 라벨이 달라 분리)
const HOME_TAB = {
  listings: { id: 'listings', label: '분양 목록' },
  publicListings: { id: 'listings', label: '분양 목록', mobileLabel: '분양목록' },
  posts: { id: 'posts', label: '게시글' },
  feed: { id: 'posts', label: '피드' },
  reviews: { id: 'reviews', label: '후기' },
  myPosts: { id: 'posts', label: '내가 쓴 글' },
  favoriteBreeders: { id: 'breeders', label: '즐겨찾는 브리더', Icon: SearchIcon },
} satisfies Record<string, HomeTabConfig>

// [refactored] 배열은 항목 조합만 담당
const MY_HOME_TABS: HomeTabConfig[] = [HOME_TAB.myPosts, HOME_TAB.favoriteBreeders]

const BREEDER_HOME_TABS: HomeTabConfig[] = [
  HOME_TAB.publicListings,
  HOME_TAB.feed,
  HOME_TAB.reviews,
]

// 브리더 마이홈은 시안(3170-825849)이 '게시글' 표기 — 입양자 마이홈의 '내가 쓴 글'과 다르다
const BREEDER_MY_HOME_TABS: HomeTabConfig[] = [
  HOME_TAB.listings,
  HOME_TAB.posts,
  HOME_TAB.favoriteBreeders,
]

// 마이홈 사이드바 하단 이동 링크 — 전체메뉴에만 있던 내 계정 화면들을 마이홈에 모은다
const MY_HOME_SIDE_LINKS = [
  { label: '저장목록', href: '/bookmarks' },
  { label: '입양 신청서', href: '/activity' },
  { label: '설정', href: '/settings' },
]

// 카드 그리드(분양·브리더). 폭에 맞춰 열 수가 늘도록 모든 구간에서 auto-fill 로 채운다.
// 원본 변형이 모바일을 max-w-[21.4375rem] 2열로 묶어둬서, 그 상한·정렬·gap 을 함께 푼다.
// 최소 152px: 320→1열, 375→2열, 710→4열. PC 2단(우측 980px)에서만 4열로 고정해 카드가 더 잘게
// 쪼개지지 않게 한다.
// 클래스는 반드시 완성된 문자열로 둔다 — Tailwind 스캐너는 정적 문자열만 읽어서
// `tab:${COLS}` 처럼 조립하면 CSS 가 생성되지 않는다(그런데 twMerge 는 충돌로 보고 원래 규칙을 지운다).
const CARD_GRID =
  'max-w-none justify-normal gap-x-5 grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] tab:max-w-none tab:justify-normal tab:gap-x-5 tab:grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] pc:grid-cols-4'

// 게시글 사진 그리드. 모바일 3열 정사각은 시안 스펙이라 그대로 두고, 2단 컬럼(tab+)에서만
// 컬럼 폭에 맞춰 채운다.
const PHOTO_GRID =
  'tab:max-w-none tab:justify-normal tab:gap-x-5 tab:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] pc:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]'

export {
  MY_HOME_TABS,
  BREEDER_HOME_TABS,
  BREEDER_MY_HOME_TABS,
  MY_HOME_SIDE_LINKS,
  CARD_GRID,
  PHOTO_GRID,
}
