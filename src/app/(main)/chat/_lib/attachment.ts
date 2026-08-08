import type { ChatMessageType } from '@/shared/types'

const ATTACHMENT_PREFIX = '__PAWPONG_ATTACHMENT_V1__'

interface ChatAttachmentPayload {
  kind: 'image' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
}

const isSafeRemoteUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const serializeChatAttachment = (payload: ChatAttachmentPayload) =>
  `${ATTACHMENT_PREFIX}${JSON.stringify(payload)}`

const parseChatAttachment = (
  content: string,
  messageType: ChatMessageType,
): ChatAttachmentPayload | null => {
  if (messageType === 'text') return null

  if (content.startsWith(ATTACHMENT_PREFIX)) {
    try {
      const parsed = JSON.parse(
        content.slice(ATTACHMENT_PREFIX.length),
      ) as Partial<ChatAttachmentPayload>
      if (
        typeof parsed.url === 'string' &&
        isSafeRemoteUrl(parsed.url) &&
        typeof parsed.name === 'string' &&
        parsed.name.length > 0 &&
        typeof parsed.size === 'number' &&
        Number.isFinite(parsed.size) &&
        parsed.size >= 0 &&
        typeof parsed.mimeType === 'string'
      ) {
        return {
          kind: parsed.kind === 'image' || parsed.kind === 'file' ? parsed.kind : messageType,
          url: parsed.url,
          name: parsed.name,
          size: parsed.size,
          mimeType: parsed.mimeType,
        }
      }
    } catch {
      return null
    }
    return null
  }

  // 초기 구현에서 URL만 content로 저장한 첨부 메시지도 계속 표시한다.
  if (isSafeRemoteUrl(content)) {
    let name = messageType === 'image' ? '이미지' : '첨부 파일'
    try {
      const pathname = new URL(content).pathname
      name = decodeURIComponent(pathname.split('/').pop() || name)
    } catch {
      // URL 유효성은 위에서 확인했으므로 기본 이름을 사용한다.
    }
    return { kind: messageType, url: content, name, size: 0, mimeType: '' }
  }

  return null
}

const getChatMessagePreview = (content?: string) => {
  if (!content) return ''
  if (!content.startsWith(ATTACHMENT_PREFIX)) return content

  try {
    const parsed = JSON.parse(
      content.slice(ATTACHMENT_PREFIX.length),
    ) as Partial<ChatAttachmentPayload>
    if (
      parsed.kind === 'image' ||
      (typeof parsed.mimeType === 'string' && parsed.mimeType.startsWith('image/'))
    ) {
      return '사진을 보냈습니다.'
    }
    return typeof parsed.name === 'string' && parsed.name
      ? `파일: ${parsed.name}`
      : '파일을 보냈습니다.'
  } catch {
    return '첨부 파일을 보냈습니다.'
  }
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  const kilobytes = bytes / 1024
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`
  const megabytes = kilobytes / 1024
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`
}

export { formatFileSize, getChatMessagePreview, parseChatAttachment, serializeChatAttachment }
export type { ChatAttachmentPayload }
