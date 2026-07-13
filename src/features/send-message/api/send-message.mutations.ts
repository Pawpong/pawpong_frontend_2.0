'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import type { CreateRoomRequestDto } from '@/shared/types'
import { createOrGetChatRoom, closeChatRoom } from './send-message.api'

// 메시지 전송은 WebSocket(useChatRoomSocket) 담당. 여기서는 방 생성/종료 뮤테이션만 제공한다.

export const useCreateOrGetChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoomRequestDto) => createOrGetChatRoom(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
  })
}

export const useCloseChatRoom = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => closeChatRoom(roomId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatQueries.all() })
    },
  })
}
