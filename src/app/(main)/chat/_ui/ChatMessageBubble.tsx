import { ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { FileIcon } from '@/shared/assets/icons'
import type { ChatMessageResponseDto } from '@/shared/types'
import { formatFileSize, parseChatAttachment } from '../_lib/attachment'
import { RelativeTime } from './RelativeTime'

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDto
  isMine: boolean
  senderName: string
  showProfile?: boolean
}

// [refactored] 말풍선 박스+텍스트를 단일 컴포넌트로 추출 — 배경·모서리만 isMine으로 분기
const Bubble = ({ content, isMine }: { content: string; isMine: boolean }) => (
  <div
    className={cn(
      'rounded-tl-2xl rounded-tr-2xl px-4 py-3 pc:p-5',
      isMine ? 'rounded-bl-2xl bg-point-500' : 'rounded-br-2xl border border-neutral-500 bg-white',
    )}
  >
    <p className="text-sm leading-[1.5] font-semibold break-words whitespace-pre-wrap text-neutral-850 pc:text-base">
      {content}
    </p>
  </div>
)

const AttachmentBubble = ({
  message,
  isMine,
}: {
  message: ChatMessageResponseDto
  isMine: boolean
}) => {
  const attachment = parseChatAttachment(message.content, message.messageType)
  if (!attachment) return <Bubble content={message.content} isMine={isMine} />

  if (message.messageType === 'image') {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          'block overflow-hidden rounded-2xl border',
          isMine ? 'border-point-500 bg-point-500' : 'border-neutral-500 bg-white',
        )}
        aria-label={`${attachment.name} 원본 이미지 열기`}
      >
        {/* 업로드 CDN 호스트가 환경별로 달라 native img로 표시한다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-80 w-auto max-w-full object-contain"
        />
      </a>
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      download={attachment.name}
      className={cn(
        'flex min-w-56 items-center gap-3 rounded-2xl border px-4 py-3 pc:p-5',
        isMine ? 'border-point-500 bg-point-500' : 'border-neutral-500 bg-white',
      )}
    >
      <FileIcon className="size-8 shrink-0 text-neutral-850" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-neutral-850 pc:text-base">
          {attachment.name}
        </span>
        {attachment.size > 0 && (
          <span className="block text-xs text-neutral-700">{formatFileSize(attachment.size)}</span>
        )}
      </span>
    </a>
  )
}

const ChatMessageBubble = ({
  message,
  isMine,
  senderName,
  showProfile = false,
}: ChatMessageBubbleProps) => {
  const time = <RelativeTime dateStr={message.createdAt} />

  // 보낸 메시지 (오른쪽 정렬, 노란 말풍선)
  if (isMine) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-[85%] items-end gap-3 pc:max-w-[18.8125rem]">
          {time}
          <AttachmentBubble message={message} isMine />
        </div>
      </div>
    )
  }

  // 받은 메시지 (왼쪽 정렬, 회색 말풍선 + 프로필)
  return (
    <div className="flex w-full flex-col items-start gap-3">
      {showProfile && (
        <div className="flex items-center gap-2">
          <ProfileAvatar size="small" />
          <span className="text-sm leading-[1.5] font-semibold text-neutral-850">{senderName}</span>
        </div>
      )}
      <div className="flex max-w-[85%] items-end gap-3 pc:max-w-[21.9375rem]">
        <AttachmentBubble message={message} isMine={false} />
        {time}
      </div>
    </div>
  )
}

export { ChatMessageBubble }
