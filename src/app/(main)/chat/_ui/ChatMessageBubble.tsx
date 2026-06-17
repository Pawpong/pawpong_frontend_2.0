import type { ChatMessageResponseDto } from '@/shared/types'
import { ProfileAvatar } from './ProfileAvatar'
import { RelativeTime } from './RelativeTime'

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDto
  isMine: boolean
  senderName: string
  showProfile?: boolean
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
          <div className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-[#fff26a] px-4 py-3 pc:p-5">
            <p className="text-sm leading-[1.5] font-semibold break-words whitespace-pre-wrap text-[#3e3e3e] pc:text-base">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 받은 메시지 (왼쪽 정렬, 회색 말풍선 + 프로필)
  return (
    <div className="flex w-full flex-col items-start gap-3">
      {showProfile && (
        <div className="flex items-center gap-2">
          <ProfileAvatar size="sm" />
          <span className="text-sm leading-[1.5] font-semibold text-[#3e3e3e]">{senderName}</span>
        </div>
      )}
      <div className="flex max-w-[85%] items-end gap-3 pc:max-w-[21.9375rem]">
        <div className="rounded-tl-2xl rounded-tr-2xl rounded-br-2xl border border-[#cacaca] bg-[#f6f6f6] px-4 py-3 pc:p-5">
          <p className="text-sm leading-[1.5] font-semibold break-words whitespace-pre-wrap text-[#3e3e3e] pc:text-base">
            {message.content}
          </p>
        </div>
        {time}
      </div>
    </div>
  )
}

export { ChatMessageBubble }
