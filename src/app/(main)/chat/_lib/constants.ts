import type { ChatRoomResponseDto } from '@/shared/types'

type FilterTab = 'all' | 'unread' | 'adoption' | 'counsel'

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안읽음' },
  { value: 'adoption', label: '입양' },
  { value: 'counsel', label: '상담' },
]

const filterRooms = (rooms: ChatRoomResponseDto[], filter: FilterTab): ChatRoomResponseDto[] => {
  if (filter === 'all') return rooms
  if (filter === 'adoption') return rooms.filter((room) => !!room.applicationId)
  return rooms
}

// [refactored] 채팅방 콘텐츠 반응형 가로 마진 (모바일 16 / 태블릿 48 / PC 80) — 섹션 4곳 공유
const CHAT_GUTTER_X = 'px-4 tab:px-12 pc:px-20'

// [refactored] 콘텐츠 폭 — 태블릿 이하는 꽉 채우고, PC에서만 880px 가운데 정렬
const CHAT_CONTENT_WIDTH = 'mx-auto w-full pc:max-w-[55rem]'

export { FILTER_TABS, filterRooms, CHAT_GUTTER_X, CHAT_CONTENT_WIDTH }
export type { FilterTab }
