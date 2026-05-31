'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import type { CreateRoomRequestDto } from '@/shared/types'
import { sendChatMessage, createOrGetChatRoom, closeChatRoom } from './send-message.api'

export const useSendMessage = (roomId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendChatMessage(roomId, { content }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatQueries.messages(roomId).queryKey })
      void qc.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
  })
}

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
