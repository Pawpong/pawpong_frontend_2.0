import type { ChatMessageResponseDto } from '@/shared/types'

/** 같은 메시지의 읽음 상태는 늦게 도착한 echo나 복귀 전 캐시로 되돌리지 않는다. */
export function mergeChatMessages(
  current: ChatMessageResponseDto[],
  incoming: ChatMessageResponseDto[],
) {
  const byId = new Map(current.map((message) => [message.messageId, message]))
  incoming.forEach((message) => {
    const existing = byId.get(message.messageId)
    byId.set(message.messageId, { ...message, isRead: Boolean(existing?.isRead || message.isRead) })
  })
  return [...byId.values()].sort((a, b) => {
    const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return timeDiff || a.messageId.localeCompare(b.messageId)
  })
}
