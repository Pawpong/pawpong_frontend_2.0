'use client'

import { useQuery } from '@tanstack/react-query'
import { chatQueries } from './Queries'

export const useChatRooms = () => useQuery(chatQueries.rooms())

export const useChatMessages = (roomId: string) => useQuery(chatQueries.messages(roomId))
