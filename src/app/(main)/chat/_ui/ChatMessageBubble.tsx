import { ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { ChatMessageResponseDto } from '@/shared/types'
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
      isMine
        ? 'rounded-bl-2xl bg-[#fff26a]'
        : 'rounded-br-2xl border border-[#cacaca] bg-[#f6f6f6]',
    )}
  >
    <p className="text-sm leading-[1.5] font-semibold break-words whitespace-pre-wrap text-[#3e3e3e] pc:text-base">
      {content}
    </p>
  </div>
)

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
          <Bubble content={message.content} isMine />
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
          <span className="text-sm leading-[1.5] font-semibold text-[#3e3e3e]">{senderName}</span>
        </div>
      )}
      <div className="flex max-w-[85%] items-end gap-3 pc:max-w-[21.9375rem]">
        <Bubble content={message.content} isMine={false} />
        {time}
      </div>
    </div>
  )
}

export { ChatMessageBubble }
