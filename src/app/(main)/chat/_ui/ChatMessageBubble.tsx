import { ChatBubble, ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { optimizedImageUrl } from '@/shared/lib/optimizedImageUrl'
import { FileIcon, LocationPinIcon } from '@/shared/assets'
import type { ChatMessageResponseDto } from '@/shared/types'
import { formatFileSize, getLocationMapUrl, parseChatAttachment } from '../_lib/attachment'
import { formatChatMessageTime } from '../_lib/utils'
import { ChatTime } from './ChatTime'

interface ChatMessageBubbleProps {
  message: ChatMessageResponseDto
  senderName: string
  senderProfileImageUrl?: string
  showProfile?: boolean
  /** 상대가 여기까지 읽었는지 — 대화 전체에서 한 말풍선에만 true 다 */
  readByCounterpart?: boolean
}

/**
 * 상대가 여기까지 읽었다는 표시. 상대 프로필을 작게 보여 준다.
 *
 * 사진만 두므로 눈으로 보지 않는 사람에게는 아무 뜻이 없다. 문장은 sr-only 로 따로 읽어 준다.
 */
const ReadMarker = ({
  senderName,
  senderProfileImageUrl,
}: {
  senderName: string
  senderProfileImageUrl?: string
}) => (
  <span className="flex items-center self-end">
    <span className="sr-only">{senderName}님이 여기까지 읽었어요</span>
    <ProfileAvatar src={senderProfileImageUrl} alt="" size="xsmall" />
  </span>
)

// [refactored] 내 것은 노랑, 상대 것은 흰 바탕 — 위치·사진·파일 카드가 글 말풍선(shared ChatBubble)과 같은 색 조합을 쓴다
const surface = (isMine: boolean) =>
  isMine ? 'border-point-500 bg-point-500' : 'border-neutral-150 bg-white'

// [refactored] 위치·파일 카드의 공통 모양 — 기본 224px, 좁은 폰에서는 줄어든다
const CARD =
  'flex w-56 min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_1px_2px_rgba(55,55,55,0.04)]'

const AttachmentBubble = ({
  message,
  isMine,
}: {
  message: ChatMessageResponseDto
  isMine: boolean
}) => {
  const attachment = parseChatAttachment(message.content, message.messageType)
  if (!attachment)
    return <ChatBubble side={isMine ? 'mine' : 'other'}>{message.content}</ChatBubble>

  if (attachment.kind === 'location') {
    return (
      <a
        href={getLocationMapUrl(attachment)}
        target="_blank"
        rel="noreferrer"
        className={cn(
          CARD,
          surface(isMine),
          'transition-colors',
          isMine ? 'hover:bg-point-300' : 'hover:bg-primary-50',
        )}
        aria-label="공유한 위치를 지도에서 열기"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80">
          <LocationPinIcon className="size-7 text-primary-500" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-850 lap:text-base">
            공유한 위치
          </span>
          <span className="block text-xs font-medium text-neutral-700">지도에서 확인하기</span>
        </span>
      </a>
    )
  }

  if (attachment.kind === 'image') {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          'block max-w-72 overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(55,55,55,0.04)]',
          surface(isMine),
        )}
        aria-label={`${attachment.name} 원본 이미지 열기`}
      >
        {/* 업로드 CDN 호스트가 환경별로 달라 native img로 표시한다.
            미리보기는 리사이즈본, 눌러서 여는 href 는 원본 — 말풍선 하나에 수 MB 가 오지 않게 한다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={optimizedImageUrl(attachment.url, 288)}
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
      className={cn(CARD, surface(isMine))}
    >
      <FileIcon className="size-8 shrink-0 text-neutral-850" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-neutral-850 lap:text-base">
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
  senderName,
  senderProfileImageUrl,
  showProfile = false,
  readByCounterpart = false,
}: ChatMessageBubbleProps) => {
  // 읽음 표시는 보낸 쪽·받은 쪽 어디에 붙어도 오른쪽 아래에 둔다.
  const readMarker = readByCounterpart && (
    <ReadMarker senderName={senderName} senderProfileImageUrl={senderProfileImageUrl} />
  )
  // [refactored] 보낸 쪽·받은 쪽이 같은 시각 표시를 쓴다 — 놓는 자리만 다르다
  const time = (
    <ChatTime
      dateStr={message.createdAt}
      format={formatChatMessageTime}
      className="text-neutral-500"
    />
  )

  // 보낸 메시지 (오른쪽 정렬, 노란 말풍선)
  if (message.isMine) {
    return (
      <div className="flex w-full flex-col items-end gap-1">
        <div className="flex max-w-[85%] items-end gap-2 lap:max-w-[26rem]">
          {time}
          <AttachmentBubble message={message} isMine />
        </div>
        {readMarker}
      </div>
    )
  }

  // 받은 메시지 (왼쪽 정렬, 흰 말풍선). 프로필은 말풍선 왼쪽에 붙이고 이름은 헤더에 맡긴다.
  // 연속 메시지는 프로필 자리만큼 비워 말풍선 줄을 맞춘다.
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <div className="flex w-full items-start gap-2">
        <span className="w-8 shrink-0">
          {showProfile && (
            <ProfileAvatar src={senderProfileImageUrl} alt={`${senderName} 프로필`} size="small" />
          )}
        </span>
        {/* 폭 제한은 말풍선·시간 묶음에만 건다 — 프로필 자리까지 포함하면 작은 폰에서 위치·파일 카드(최소 224px)가 넘친다 */}
        <div className="flex max-w-[85%] min-w-0 items-end gap-2 lap:max-w-[26rem]">
          <AttachmentBubble message={message} isMine={false} />
          {time}
        </div>
      </div>
      {readMarker}
    </div>
  )
}

export { ChatMessageBubble }
