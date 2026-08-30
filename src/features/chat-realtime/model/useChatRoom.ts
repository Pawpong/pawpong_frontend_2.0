'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { getAccessToken } from '@/shared/api'
import type {
  ChatMessageResponseDto,
  ChatMessageType,
  WsChatMessage,
  WsMessagesRead,
} from '@/shared/types'
import { useChatSocket } from './useChatSocket'

const mergeMessages = (current: ChatMessageResponseDto[], incoming: ChatMessageResponseDto[]) => {
  const byId = new Map(current.map((message) => [message.messageId, message]))
  incoming.forEach((message) => byId.set(message.messageId, message))
  return [...byId.values()].sort((a, b) => {
    const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return timeDiff || a.messageId.localeCompare(b.messageId)
  })
}

interface LiveMessageState {
  roomId: string
  messages: ChatMessageResponseDto[]
}

const useChatRoom = (roomId: string, currentUserId: string) => {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => chatQueries.messages(roomId).queryKey, [roomId])
  const [usePolling, setUsePolling] = useState(false)
  const [socketError, setSocketError] = useState<string | null>(null)
  const [liveState, setLiveState] = useState<LiveMessageState>({ roomId, messages: [] })
  const token = getAccessToken()

  const messagesQuery = useQuery({
    ...chatQueries.messages(roomId),
    refetchInterval: usePolling ? 3_000 : false,
    refetchIntervalInBackground: false,
    throwOnError: false,
  })

  const handleConnect = useCallback(() => {
    setUsePolling(false)
    setSocketError(null)
    void queryClient.invalidateQueries({ queryKey })
    void queryClient.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
  }, [queryClient, queryKey])

  const handleDisconnect = useCallback(() => {
    setUsePolling(true)
  }, [])

  const handleSocketError = useCallback((message: string) => {
    setSocketError(message)
  }, [])

  const handleNewMessage = useCallback(
    (event: WsChatMessage) => {
      if (event.roomId !== roomId) return

      const normalized: ChatMessageResponseDto = {
        messageId: event.messageId,
        roomId: event.roomId,
        senderRole: event.senderRole,
        isMine: event.senderId === currentUserId,
        content: event.content,
        messageType: event.messageType,
        isRead: event.isRead,
        createdAt:
          typeof event.createdAt === 'string' ? event.createdAt : event.createdAt.toISOString(),
      }

      setLiveState((current) => ({
        roomId,
        messages: mergeMessages(current.roomId === roomId ? current.messages : [], [normalized]),
      }))
      queryClient.setQueryData<ChatMessageResponseDto[]>(queryKey, (current = []) =>
        mergeMessages(current, [normalized]),
      )
      void queryClient.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
    [currentUserId, queryClient, queryKey, roomId],
  )

  const handleMessagesRead = useCallback(
    (event: WsMessagesRead) => {
      if (event.roomId !== roomId) return

      const updateReadState = (messages: ChatMessageResponseDto[]) =>
        messages.map((message) => {
          const wasReadByCurrentUser = event.readBy === currentUserId && !message.isMine
          const wasReadByCounterpart = event.readBy !== currentUserId && message.isMine
          return wasReadByCurrentUser || wasReadByCounterpart
            ? { ...message, isRead: true }
            : message
        })

      setLiveState((current) =>
        current.roomId === roomId
          ? { roomId, messages: updateReadState(current.messages) }
          : current,
      )
      queryClient.setQueryData<ChatMessageResponseDto[]>(queryKey, (current = []) =>
        updateReadState(current),
      )
      void queryClient.invalidateQueries({ queryKey: chatQueries.rooms().queryKey })
    },
    [currentUserId, queryClient, queryKey, roomId],
  )

  const {
    isConnected,
    sendMessage: emitMessage,
    markAsRead,
  } = useChatSocket({
    roomId,
    token,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onNewMessage: handleNewMessage,
    onMessagesRead: handleMessagesRead,
    onError: handleSocketError,
  })

  const sendMessage = useCallback(
    (content: string, messageType: ChatMessageType = 'text') => {
      setSocketError(null)
      const sent = emitMessage(content, messageType)
      if (!sent) setSocketError('실시간 연결을 확인한 뒤 다시 보내주세요.')
      return sent
    },
    [emitMessage],
  )

  const messages = useMemo(
    () =>
      mergeMessages(
        messagesQuery.data ?? [],
        liveState.roomId === roomId ? liveState.messages : [],
      ),
    [liveState, messagesQuery.data, roomId],
  )

  return {
    messages,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    isConnected,
    socketError,
    sendMessage,
    markAsRead,
    refetch: messagesQuery.refetch,
  }
}

export { useChatRoom }
