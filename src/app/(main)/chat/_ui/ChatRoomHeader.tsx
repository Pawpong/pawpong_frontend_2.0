'use client'

import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon, MoreVertIcon } from '@/shared/assets/icons'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { ProfileAvatar } from './ProfileAvatar'

interface ChatRoomHeaderProps {
  displayName: string
  hasApplication: boolean
  onBack: () => void
}

const ChatRoomHeader = ({ displayName, hasApplication, onBack }: ChatRoomHeaderProps) => {
  return (
    <div
      className={cn('bg-white py-1 pc:py-2 shadow-[0px_7px_7px_rgba(55,55,55,0.1)]', CHAT_GUTTER_X)}
    >
      <div className={cn(CHAT_CONTENT_WIDTH, 'flex items-center justify-between')}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1">
            <button type="button" onClick={onBack} className="shrink-0" aria-label="뒤로 가기">
              <ArrowBackIcon className="size-8 text-[#6b6b6b]" />
            </button>
            <div className="flex items-center gap-2">
              <ProfileAvatar size="responsive" />
              <span className="text-sm leading-[1.5] font-semibold text-[#3e3e3e] pc:text-base">
                {displayName}
              </span>
            </div>
          </div>
          {hasApplication && <Badge variant="active">애정도</Badge>}
        </div>
        <button type="button" className="shrink-0" aria-label="더보기">
          <MoreVertIcon className="size-6 text-[#3e3e3e]" />
        </button>
      </div>
    </div>
  )
}

export { ChatRoomHeader }
