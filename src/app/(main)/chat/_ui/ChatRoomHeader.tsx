'use client'

// 애정도 뱃지 보류로 AffectionBadge import 제거 (복구 시 함께 되살린다)
import { ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon } from '@/shared/assets'
import { CHAT_CONTENT_WIDTH } from '../_lib/constants'
import { ChatRoomActionsMenu } from './ChatRoomActionsMenu'

interface ChatRoomHeaderProps {
  roomId: string
  displayName: string
  profileImageUrl?: string
  /** 애정도 뱃지 노출 조건 — 뱃지 보류로 현재 미사용
  hasApplication: boolean */
  onBack: () => void
  onRoomClosed: () => void
}

const ChatRoomHeader = ({
  roomId,
  displayName,
  profileImageUrl,
  onBack,
  onRoomClosed,
}: ChatRoomHeaderProps) => {
  return (
    <div className="bg-white px-4 py-1 shadow-[0px_7px_7px_rgba(55,55,55,0.1)] tab:px-12 pc:px-2.5 pc:py-2">
      <div className={cn(CHAT_CONTENT_WIDTH, 'flex items-center justify-between')}>
        <div className="flex min-w-0 items-center gap-5 pc:gap-7">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onBack}
              className="-m-1 flex size-10 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label="뒤로 가기"
            >
              <ArrowBackIcon className="size-6 text-neutral-700" />
            </button>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                src={profileImageUrl}
                alt={`${displayName} 프로필`}
                size="responsive"
              />
              <span className="max-w-36 truncate text-body-s font-semibold text-neutral-850 pc:max-w-[21.625rem]">
                {displayName}
              </span>
            </div>
          </div>
          {/* 애정도 뱃지 — 정책 미확정으로 노출 보류 (docs/design.md — BPM/EXP 는 추정 구현하지 않는다)
          {hasApplication && <AffectionBadge />} */}
        </div>
        <ChatRoomActionsMenu
          roomId={roomId}
          counterpartName={displayName}
          onClosed={onRoomClosed}
        />
      </div>
    </div>
  )
}

export { ChatRoomHeader }
