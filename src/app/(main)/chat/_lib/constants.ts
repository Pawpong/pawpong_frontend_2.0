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

export { FILTER_TABS, filterRooms }
export type { FilterTab }
