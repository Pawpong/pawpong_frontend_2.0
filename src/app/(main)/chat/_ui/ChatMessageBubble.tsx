import { Avatar, AvatarFallback } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { ChatMessageResponseDto } from '@/shared/types'
import { formatRelativeTime } from './ChatRoomItem'

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDto
  isMine: boolean
  showAvatar?: boolean
}

const ChatMessageBubble = ({ message, isMine, showAvatar = false }: ChatMessageBubbleProps) => {
  return (
    <div className={cn('flex items-end gap-[0.688rem]', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar for received messages */}
      {!isMine && showAvatar && (
        <Avatar size="sm" className="size-[3.5rem] shrink-0">
          <AvatarFallback />
        </Avatar>
      )}
      {!isMine && !showAvatar && <div className="w-[3.5rem] shrink-0" />}

      {/* Timestamp (before bubble for received, after for sent) */}
      {isMine && (
        <span className="shrink-0 text-sm leading-[1.375rem] font-medium text-text-primary">
          {formatRelativeTime(message.createdAt)}
        </span>
      )}

      {/* Message Bubble */}
      <div className={cn('max-w-[29.125rem] rounded-[1.25rem] p-5', 'bg-fill-muted')}>
        <p className="text-base leading-[1.375rem] font-semibold break-words whitespace-pre-wrap text-text-primary">
          {message.content}
        </p>
      </div>

      {/* Timestamp for received */}
      {!isMine && (
        <span className="shrink-0 text-sm leading-[1.375rem] font-medium text-text-primary">
          {formatRelativeTime(message.createdAt)}
        </span>
      )}
    </div>
  )
}

export { ChatMessageBubble }
