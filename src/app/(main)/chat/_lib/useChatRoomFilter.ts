'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { type FilterTab, filterRooms } from './constants'

// [refactored] sidebar/list가 동일하게 가지고 있던 필터 상태 + 방 필터링 로직을 훅으로 추출
const useChatRoomFilter = () => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const roomsQuery = useQuery({
    ...chatQueries.rooms(),
    refetchInterval: 5_000,
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
