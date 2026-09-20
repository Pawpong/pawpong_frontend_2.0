'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import type { ChatRoomResponseDto, CreateRoomRequestDto } from '@/shared/types'
import {
  createOrGetChatRoom,
  closeChatRoom,
  blockChatUser,
  unblockChatUser,
} from './send-message.api'

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
    onSuccess: (_data, roomId) => {
      // 종료된 방은 백엔드 목록에서 제외된다. 재조회 왕복 전에 화면에서도 즉시 제거해
      // 선택된 방이 잠깐 오류 상태로 바뀌거나 목록에 남는 깜빡임을 막는다.
      qc.setQueryData<ChatRoomResponseDto[]>(chatQueries.rooms().queryKey, (rooms) =>
        rooms?.filter((room) => room.roomId !== roomId),
      )
      qc.removeQueries({ queryKey: [...chatQueries.all(), 'messages', roomId] })
      void qc.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
  })
}

/**
 * 사용자 차단.
 *
 * App Store 1.2 / Play UGC 정책이 1:1 대화가 있는 앱에 차단 수단을 요구한다.
 * 백엔드는 이전부터 있었는데 화면에서 부르는 곳이 없어 사실상 없는 기능이었다.
 *
 * 차단하면 해당 방은 목록에서 내려가므로 나가기와 같은 방식으로 캐시를 정리한다.
 */
export const useBlockChatUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }: { userId: string; roomId?: string }) => blockChatUser(userId),
    onSuccess: (_data, { roomId }) => {
      if (roomId) {
        qc.setQueryData<ChatRoomResponseDto[]>(chatQueries.rooms().queryKey, (rooms) =>
          rooms?.filter((room) => room.roomId !== roomId),
        )
        qc.removeQueries({ queryKey: [...chatQueries.all(), 'messages', roomId] })
      }
      void qc.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
  })
}

/** 사용자 차단 해제 */
export const useUnblockChatUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => unblockChatUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
  })
}
