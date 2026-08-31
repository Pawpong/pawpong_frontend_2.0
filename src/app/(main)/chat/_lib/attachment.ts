import type { ChatMessageType } from '@/shared/types'

const ATTACHMENT_PREFIX = '__PAWPONG_ATTACHMENT_V1__'

interface ChatFileAttachmentPayload {
  kind: 'image' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
}

interface ChatLocationPayload {
  kind: 'location'
  latitude: number
  longitude: number
  accuracy: number
}

type ChatAttachmentPayload = ChatFileAttachmentPayload | ChatLocationPayload

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

const isValidCoordinate = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLocationPayload = (value: unknown): value is ChatLocationPayload =>
  isRecord(value) &&
  value.kind === 'location' &&
  isValidCoordinate(value.latitude, -90, 90) &&
  isValidCoordinate(value.longitude, -180, 180) &&
  typeof value.accuracy === 'number' &&
  Number.isFinite(value.accuracy) &&
  value.accuracy >= 0

const isFileAttachmentPayload = (value: unknown): value is ChatFileAttachmentPayload =>
  isRecord(value) &&
  (value.kind === 'image' || value.kind === 'file') &&
  typeof value.url === 'string' &&
  isSafeRemoteUrl(value.url) &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  typeof value.size === 'number' &&
  Number.isFinite(value.size) &&
  value.size >= 0 &&
  typeof value.mimeType === 'string'

const parseChatAttachment = (
  content: string,
  messageType: ChatMessageType,
): ChatAttachmentPayload | null => {
  if (messageType === 'text') return null

  if (content.startsWith(ATTACHMENT_PREFIX)) {
    try {
      const parsed: unknown = JSON.parse(content.slice(ATTACHMENT_PREFIX.length))
      if (messageType === 'location' && isLocationPayload(parsed)) return parsed

      if (messageType !== 'location' && isFileAttachmentPayload(parsed)) return parsed
    } catch {
      return null
    }
    return null
  }

  // 초기 구현에서 URL만 content로 저장한 첨부 메시지도 계속 표시한다.
  if (messageType !== 'location' && isSafeRemoteUrl(content)) {
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
    const parsed: unknown = JSON.parse(content.slice(ATTACHMENT_PREFIX.length))
    if (isRecord(parsed) && parsed.kind === 'location') {
      return '위치를 공유했습니다.'
    }
    if (
      isRecord(parsed) &&
      (parsed.kind === 'image' ||
        (typeof parsed.mimeType === 'string' && parsed.mimeType.startsWith('image/')))
    ) {
      return '사진을 보냈습니다.'
    }
    return isRecord(parsed) && typeof parsed.name === 'string' && parsed.name
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

const getLocationMapUrl = ({ latitude, longitude }: ChatLocationPayload) => {
  const params = new URLSearchParams({
    mlat: String(latitude),
    mlon: String(longitude),
  })
  return `https://www.openstreetmap.org/?${params.toString()}#map=16/${latitude}/${longitude}`
}

export {
  formatFileSize,
  getChatMessagePreview,
  getLocationMapUrl,
  parseChatAttachment,
  serializeChatAttachment,
}
export type { ChatAttachmentPayload, ChatFileAttachmentPayload, ChatLocationPayload }
