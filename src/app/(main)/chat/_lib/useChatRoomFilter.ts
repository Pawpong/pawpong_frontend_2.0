'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { useAuthStatus } from '@/features/auth'
import { type FilterTab, filterRooms } from './constants'

// [refactored] sidebar/list가 동일하게 가지고 있던 필터 상태 + 방 필터링 로직을 훅으로 추출
const useChatRoomFilter = () => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const { userRole } = useAuthStatus()
  // 방을 열면 소켓 이벤트가 rooms를 invalidate하고, 목록만 보고 있을 때는 상단 NavBar 의 채팅 뱃지가
  // 같은 캐시를 30초마다 폴링한다. 옵저버마다 인터벌을 걸면 요청이 중복되므로 여기서는 구독만 한다.
  const roomsQuery = useQuery({
    ...chatQueries.rooms(),
    throwOnError: false,
  })
  const filteredRooms = React.useMemo(
    () => filterRooms(roomsQuery.data ?? [], filter, userRole),
    [filter, roomsQuery.data, userRole],
  )

  return {
    filter,
    setFilter,
    filteredRooms,
    isLoading: roomsQuery.isLoading,
    isError: roomsQuery.isError,
    refetch: roomsQuery.refetch,
  }
}

export { useChatRoomFilter }
