'use client'

import { CheckIcon, CloseIcon } from '@/shared/assets/icons'

interface ChatNoticeBannerProps {
  onClose?: () => void
}

const ChatNoticeBanner = ({ onClose }: ChatNoticeBannerProps) => {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg bg-[#d3e2fd] p-2">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <CheckIcon className="size-6 shrink-0 text-[#256ef4]" />
        <p className="min-w-0 flex-1 truncate text-sm leading-[1.5] font-semibold text-[#256ef4]">
          담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요. 채팅 내용을 pawpong 팀이 검수
          할 수 있습니다.
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 text-sm leading-[1.5] font-medium text-[#256ef4] underline"
      >
        자세히
      </button>
      <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
        <CloseIcon className="size-6 text-[#256ef4]" />
      </button>
    </div>
  )
}

export { ChatNoticeBanner }
