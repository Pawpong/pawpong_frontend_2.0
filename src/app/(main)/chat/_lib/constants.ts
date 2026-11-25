import type { ChatRoomResponseDto } from '@/shared/types'
import type { TabBarItem } from '@/shared/ui'

type ChatFilter = 'all' | 'unread' | 'adoption' | 'counsel' | 'general'

const FILTER_TABS: ReadonlyArray<TabBarItem & { value: ChatFilter }> = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안읽음' },
  { value: 'adoption', label: '입양' },
  { value: 'counsel', label: '상담' },
  { value: 'general', label: '일반' },
]

// 신청서(applicationId) 기반이든, 신청서 없이 분양글에서 바로 문의(petId)한 방이든
// 특정 개체와 연결돼 있으면 모두 "입양" 문의로 본다.
const isAdoptionRoom = (room: ChatRoomResponseDto) => !!room.applicationId || !!room.petId

// 입양자끼리의 대화는 입양/상담 어느 쪽도 아닌 "일반" 대화로 본다
const isGeneralRoom = (room: ChatRoomResponseDto, userRole: string | null) =>
  userRole === 'adopter' && room.counterpart.role === 'adopter'

const filterRooms = (
  rooms: ChatRoomResponseDto[],
  filter: ChatFilter,
  userRole: string | null,
): ChatRoomResponseDto[] => {
  if (filter === 'all') return rooms
  if (filter === 'unread') return rooms.filter((room) => room.unreadCount > 0)
  if (filter === 'adoption') return rooms.filter(isAdoptionRoom)
  if (filter === 'general') return rooms.filter((room) => isGeneralRoom(room, userRole))
  return rooms.filter((room) => !isAdoptionRoom(room) && !isGeneralRoom(room, userRole))
}

// 채팅방 콘텐츠 가로 폭·여백 — 페이지 틀(page-shell)과 같다. 섹션 4곳 공유.
const CHAT_GUTTER_X = 'page-shell'

// 헤더(Gnb) 아래를 꽉 채우는 높이 — 모바일·태블릿 3rem · PC 4rem 은 로고 바 높이만큼 뺀다.
// 앱은 채팅에서 로고 바를 숨기므로(Gnb hideAppHeader) 빼지 않는다.
const CHAT_PANEL_HEIGHT = 'h-[calc(100dvh-3rem)] pc:h-[calc(100dvh-4rem)] in-data-app:h-dvh'

// 채팅 목록 화면은 하단 내비(모바일·태블릿 3.5rem + 노치)가 있어 그만큼 더 비켜야 한다.
// PC 는 하단 내비가 없으므로 헤더만 뺀다.
const CHAT_LIST_HEIGHT =
  'h-[calc(100dvh-3rem-3.5rem-env(safe-area-inset-bottom))] pc:h-[calc(100dvh-4rem)] in-data-app:h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom))]'

// [refactored] 콘텐츠 폭 — 태블릿 이하는 꽉 채우고, PC에서만 880px 가운데 정렬
const CHAT_CONTENT_WIDTH = 'mx-auto w-full pc:max-w-[55rem]'

export {
  FILTER_TABS,
  filterRooms,
  isAdoptionRoom,
  isGeneralRoom,
  CHAT_GUTTER_X,
  CHAT_CONTENT_WIDTH,
  CHAT_PANEL_HEIGHT,
  CHAT_LIST_HEIGHT,
}
export type { ChatFilter }
