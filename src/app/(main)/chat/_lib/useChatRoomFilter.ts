'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { type FilterTab, filterRooms } from './constants'

// [refactored] sidebar/list가 동일하게 가지고 있던 필터 상태 + 방 필터링 로직을 훅으로 추출
const useChatRoomFilter = () => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  // 방을 열면 소켓 이벤트가 rooms를 invalidate하므로, 폴링은 목록만 보고 있을 때의 보조 수단이다.
  // 폴링 선언은 이 훅 한 곳에만 둔다 (옵저버마다 걸면 인터벌이 각자 돌아 요청이 중복된다).
  const roomsQuery = useQuery({
    ...chatQueries.rooms(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const filteredRooms = React.useMemo(
    () => filterRooms(roomsQuery.data ?? [], filter),
    [filter, roomsQuery.data],
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
