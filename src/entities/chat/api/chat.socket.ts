'use client'

import { useCallback, useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import type { ChatMessageResponseDto, ChatNewMessagePayload } from '@/shared/types'
import { chatQueries } from './chat.queries'

/** accessToken 쿠키 읽기 (WebSocket 핸드셰이크 인증용) */
const getAccessToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([key]) => key === 'accessToken')?.[1]
}

/** 소켓 접속 오리진 (axios baseURL 과 동일한 서버 오리진) */
const getSocketBase = () => (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '')

/** 브로드캐스트 페이로드 → REST DTO 정규화 (isMine 은 현재 사용자 기준 계산) */
const normalizeMessage = (
  payload: ChatNewMessagePayload,
  currentUserId: string,
): ChatMessageResponseDto => ({
  messageId: payload.messageId,
  roomId: payload.roomId,
  senderRole: payload.senderRole,
  isMine: payload.senderId === currentUserId,
  content: payload.content,
  messageType: payload.messageType,
  isRead: payload.isRead,
  createdAt: payload.createdAt,
})

/**
 * 채팅방 WebSocket 연결 훅.
 * - /chat 네임스페이스에 accessToken 으로 접속 후 방 입장(join_room) + 읽음 처리(read_messages)
 * - new_message 수신 시 메시지 쿼리 캐시에 추가하고 방 목록(미리보기/안읽음)을 무효화
 * - sendMessage 로 send_message emit (실제 broadcast 는 백엔드 Kafka 소비자가 담당하므로,
 *   로컬에서 실시간 수신을 보려면 백엔드 Kafka 가 떠 있어야 함)
 */
export const useChatRoomSocket = (roomId: string | undefined, currentUserId: string) => {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!roomId || !token) return

    const socket = io(`${getSocketBase()}/chat`, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
    })
    socketRef.current = socket

    const joinAndRead = () => {
      socket.emit('join_room', { roomId })
      socket.emit('read_messages', { roomId })
    }
    socket.on('connect', joinAndRead)

    const handleNewMessage = (payload: ChatNewMessagePayload) => {
      if (payload.roomId !== roomId) return
      const message = normalizeMessage(payload, currentUserId)
      queryClient.setQueryData<ChatMessageResponseDto[]>(
        chatQueries.messages(roomId).queryKey,
        (prev = []) =>
          prev.some((m) => m.messageId === message.messageId) ? prev : [...prev, message],
      )
      // 방 목록의 마지막 메시지/안읽음 카운트 갱신
      void queryClient.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    }
    socket.on('new_message', handleNewMessage)

    return () => {
      socket.emit('leave_room', { roomId })
      socket.off('new_message', handleNewMessage)
      socket.off('connect', joinAndRead)
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId, currentUserId, queryClient])

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || !socketRef.current) return
      socketRef.current.emit('send_message', { roomId, content: trimmed, messageType: 'text' })
    },
    [roomId],
  )

  return { sendMessage }
}
