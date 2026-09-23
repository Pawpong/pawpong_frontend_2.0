'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { WsChatMessage, WsMessagesRead } from '@/shared/types'
import { getApiBaseUrl } from '@/shared/config/apiBaseUrl'
import { getAccessToken } from '@/shared/api'
import { restoreAuthSession } from '@/shared/lib/authSessionRecovery'
import {
  deliverChatMessage,
  type OutgoingChatMessage,
  type ChatDeliveryResult,
} from './chatDelivery'

const getSocketUrl = () => {
  const configuredUrl = getApiBaseUrl()
  if (configuredUrl) return `${configuredUrl}/chat`
  return 'http://localhost:8080/chat'
}

interface UseChatSocketOptions {
  roomId: string
  currentUserId: string
  token: string | null
  onConnect?: () => void
  onDisconnect?: () => void
  onNewMessage: (message: WsChatMessage) => void
  onMessagesRead: (event: WsMessagesRead) => void
  onError?: (message: string) => void
}

const useChatSocket = ({
  roomId,
  currentUserId,
  token,
  onConnect,
  onDisconnect,
  onNewMessage,
  onMessagesRead,
  onError,
}: UseChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null)
  const connectionAbort = useRef<AbortController | null>(null)
  const connectionKey = useMemo(
    () => Symbol(`chat-connection:${roomId}:${token ? 'authenticated' : 'anonymous'}`),
    [roomId, token],
  )
  const [connectedKey, setConnectedKey] = useState<symbol | null>(null)

  useEffect(() => {
    if (!token || !roomId) return

    const socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
      timeout: 10_000,
    })
    socketRef.current = socket
    const controller = new AbortController()
    connectionAbort.current = controller

    const handleConnect = () => {
      setConnectedKey(connectionKey)
      socket.emit('join_room', { roomId })
      onConnect?.()
    }
    const handleDisconnect = () => {
      setConnectedKey((current) => (current === connectionKey ? null : current))
      onDisconnect?.()
    }
    const handleConnectError = (error: Error) => {
      setConnectedKey((current) => (current === connectionKey ? null : current))
      onError?.(error.message || '실시간 채팅 서버에 연결하지 못했습니다.')
      onDisconnect?.()
    }
    const handleServerError = (error: { message?: string } | string) => {
      onError?.(
        typeof error === 'string' ? error : (error.message ?? '채팅 요청을 처리하지 못했습니다.'),
      )
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('new_message', onNewMessage)
    socket.on('messages_read', onMessagesRead)
    socket.on('error', handleServerError)
    socket.connect()

    const resume = () => {
      if (document.visibilityState === 'hidden') return
      void restoreAuthSession()
        .then(() => {
          if (controller.signal.aborted || getAccessToken() !== token) return
          // 인증 거절·서버 disconnect는 Socket.IO가 자동 재접속하지 않는 경우도 있다.
          if (!socket.connected) socket.connect()
          else onConnect?.()
        })
        .catch(() => {})
    }
    window.addEventListener('online', resume)
    window.addEventListener('pageshow', resume)
    window.addEventListener('pawpong:app-active', resume)
    document.addEventListener('visibilitychange', resume)

    return () => {
      controller.abort()
      window.removeEventListener('online', resume)
      window.removeEventListener('pageshow', resume)
      window.removeEventListener('pawpong:app-active', resume)
      document.removeEventListener('visibilitychange', resume)
      if (socket.connected) socket.emit('leave_room', { roomId })
      socket.removeAllListeners()
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [connectionKey, roomId, token, onConnect, onDisconnect, onNewMessage, onMessagesRead, onError])

  const sendMessage = useCallback(
    (payload: OutgoingChatMessage): Promise<ChatDeliveryResult> => {
      const socket = socketRef.current
      const controller = connectionAbort.current
      if (!socket?.connected || connectedKey !== connectionKey || !controller)
        return Promise.resolve({ status: 'failed' })
      return deliverChatMessage(socket, payload, currentUserId, controller.signal)
    },
    [connectedKey, connectionKey, currentUserId],
  )

  const markAsRead = useCallback(() => {
    const socket = socketRef.current
    if (!socket?.connected || connectedKey !== connectionKey) return false
    socket.emit('read_messages', { roomId })
    return true
  }, [connectedKey, connectionKey, roomId])

  return {
    isConnected: Boolean(token && roomId && connectedKey === connectionKey),
    sendMessage,
    markAsRead,
  }
}

export { useChatSocket }
