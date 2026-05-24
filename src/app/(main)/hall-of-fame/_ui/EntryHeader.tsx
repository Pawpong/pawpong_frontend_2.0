import { VoteIcon } from '@/shared/assets/icons'
import type { ContestEntry, HomeUserType } from '@/shared/types'

interface EntryHeaderProps {
  entry: ContestEntry
  onClose: () => void
  userType: HomeUserType
  className?: string
}

/** 상단 헤더 (닫기 + 투표/참여 상태) */
const EntryHeader = ({ entry, onClose, userType, className }: EntryHeaderProps) => (
  <div className={`flex shrink-0 items-center ${className ?? ''}`}>
    <button
      type="button"
      className="flex w-[3.625rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem] tab:w-[5.75rem]"
      onClick={onClose}
    >
      <span className="text-sm font-medium text-white">닫기</span>
    </button>

    {userType === 'breeder' && entry.isVoted && (
      <div className="ml-auto flex items-center gap-1.5 tab:ml-0 tab:gap-2">
        <span className="text-sm font-medium text-white tab:text-base">투표했습니다</span>
        <VoteIcon className="size-6 text-white" />
        <span className="text-sm leading-[1.375rem] font-semibold text-white">
          {entry.voteCount}
        </span>
      </div>
    )}

    {userType === 'adopter' && (
      <span className="ml-3 text-sm font-medium text-white tab:ml-4 tab:text-base">
        {entry.participant.name}님이 참여한 글입니다.
      </span>
    )}
  </div>
)

export { EntryHeader }
