'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { WsChatMessage, WsMessagesRead } from '@/shared/types'

const getSocketUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')
  if (configuredUrl) return `${configuredUrl}/chat`
  return 'http://localhost:8080/chat'
}

interface UseChatSocketOptions {
  roomId: string
  token: string | null
  onConnect?: () => void
  onDisconnect?: () => void
  onNewMessage: (message: WsChatMessage) => void
  onMessagesRead: (event: WsMessagesRead) => void
  onError?: (message: string) => void
}

const useChatSocket = ({
  roomId,
  token,
  onConnect,
  onDisconnect,
  onNewMessage,
  onMessagesRead,
  onError,
}: UseChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null)
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

    return () => {
      if (socket.connected) socket.emit('leave_room', { roomId })
      socket.removeAllListeners()
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [connectionKey, roomId, token, onConnect, onDisconnect, onNewMessage, onMessagesRead, onError])

  const sendMessage = useCallback(
    (content: string, messageType: WsChatMessage['messageType'] = 'text') => {
      const socket = socketRef.current
      if (!socket?.connected || connectedKey !== connectionKey) return false
      socket.emit('send_message', { roomId, content, messageType })
      return true
    },
    [connectedKey, connectionKey, roomId],
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
