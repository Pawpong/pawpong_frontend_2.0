'use client'

import * as React from 'react'
import { MOCK_CHAT_ROOMS } from '@/shared/mocks/chat'
import { type FilterTab, filterRooms } from './constants'

// [refactored] sidebar/list가 동일하게 가지고 있던 필터 상태 + 방 필터링 로직을 훅으로 추출
const useChatRoomFilter = () => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const filteredRooms = filterRooms(MOCK_CHAT_ROOMS, filter)

  return { filter, setFilter, filteredRooms }
}

export { useChatRoomFilter }
