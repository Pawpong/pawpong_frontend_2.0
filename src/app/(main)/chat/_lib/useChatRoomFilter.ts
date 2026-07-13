'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { type FilterTab, filterRooms } from './constants'

// [refactored] sidebar/list가 동일하게 가지고 있던 필터 상태 + 방 필터링 로직을 훅으로 추출
// 방 목록은 실제 API(GET /chat/rooms)에서 조회한다.
const useChatRoomFilter = () => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const { data: rooms, isLoading, isError } = useQuery(chatQueries.rooms())
  const filteredRooms = filterRooms(rooms ?? [], filter)

  return { filter, setFilter, filteredRooms, isLoading, isError }
}

export { useChatRoomFilter }
