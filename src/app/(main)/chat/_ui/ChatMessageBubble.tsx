import { cn } from '@/shared/lib/Cn'
import type { ChatMessageResponseDto } from '@/shared/types'
import { formatRelativeTime } from '../_lib/utils'

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDto
  isMine: boolean
  showAvatar?: boolean
}

const ChatMessageBubble = ({ message, isMine, showAvatar = false }: ChatMessageBubbleProps) => {
  return (
    <div className={cn('flex items-end gap-[0.375rem] pc:gap-[0.688rem]', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar for received messages */}
      {!isMine && showAvatar && (
        <div className="size-8 shrink-0 rounded-full bg-fill-muted pc:size-[3.5rem]" />
      )}
      {!isMine && !showAvatar && <div className="w-8 shrink-0 pc:w-[3.5rem]" />}

      {/* Timestamp (before bubble for received, after for sent) */}
      {isMine && (
        <span className="shrink-0 text-[0.625rem] leading-[1.375rem] font-medium text-text-primary pc:text-sm">
          {formatRelativeTime(message.createdAt)}
        </span>
      )}

      {/* Message Bubble */}
      <div className={cn('max-w-[11.25rem] rounded-[1.25rem] px-[0.5625rem] py-[0.3125rem] pc:max-w-[29.125rem] pc:p-5', 'bg-fill-muted')}>
        <p className="text-sm leading-[1.5] font-semibold break-words whitespace-pre-wrap text-text-primary pc:text-base pc:leading-[1.375rem]">
          {message.content}
        </p>
      </div>

      {/* Timestamp for received */}
      {!isMine && (
        <span className="shrink-0 text-[0.625rem] leading-[1.375rem] font-medium text-text-primary pc:text-sm">
          {formatRelativeTime(message.createdAt)}
        </span>
      )}
    </div>
  )
}

export { ChatMessageBubble }
