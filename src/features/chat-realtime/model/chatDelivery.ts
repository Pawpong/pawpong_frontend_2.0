import type { Socket } from 'socket.io-client'
import type { ChatMessageType, WsChatMessage } from '@/shared/types'

export interface OutgoingChatMessage {
  roomId: string
  content: string
  messageType: ChatMessageType
  clientMessageId: string
}
export type ChatDeliveryResult =
  | { status: 'sent'; messageId: string }
  | { status: 'failed' | 'unconfirmed'; message?: string }

export function createClientMessageId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** 새 서버는 저장 ACK, 이전 서버는 본인 echo로 확인한다. 확인 전 재전송은 하지 않는다. */
export function deliverChatMessage(
  socket: Socket,
  payload: OutgoingChatMessage,
  currentUserId: string,
  signal: AbortSignal,
): Promise<ChatDeliveryResult> {
  if (!socket.connected || signal.aborted) return Promise.resolve({ status: 'failed' })
  return new Promise((resolve) => {
    let settled = false
    const finish = (result: ChatDeliveryResult) => {
      if (settled) return
      settled = true
      socket.off('new_message', onMessage)
      socket.off('disconnect', onDisconnect)
      socket.off('error', onError)
      signal.removeEventListener('abort', onDisconnect)
      resolve(result)
    }
    const onMessage = (message: WsChatMessage) => {
      if (message.roomId !== payload.roomId || message.senderId !== currentUserId) return
      if (
        message.clientMessageId
          ? message.clientMessageId !== payload.clientMessageId
          : message.content !== payload.content || message.messageType !== payload.messageType
      )
        return
      finish({ status: 'sent', messageId: message.messageId })
    }
    const onDisconnect = () => finish({ status: 'unconfirmed' })
    const onError = (error: { message?: string }) =>
      finish({ status: 'unconfirmed', message: error?.message })
    socket.on('new_message', onMessage)
    socket.on('disconnect', onDisconnect)
    socket.on('error', onError)
    signal.addEventListener('abort', onDisconnect, { once: true })
    // volatile은 전송 불가한 패킷을 재접속 때 몰래 재전송하지 않는다.
    // timeout은 ACK가 없는 구 서버에서도 Socket.IO의 콜백 등록을 해제한다.
    socket.timeout(10_000).volatile.emit(
      'send_message',
      payload,
      (
        error: Error | null,
        ack?: {
          success?: boolean
          messageId?: string
          error?: string
        },
      ) => {
        if (error) return finish({ status: 'unconfirmed' })
        if (ack?.success && typeof ack.messageId === 'string')
          return finish({ status: 'sent', messageId: ack.messageId })
        if (ack?.success === false) return finish({ status: 'failed', message: ack.error })
        finish({ status: 'unconfirmed' })
      },
    )
  })
}
