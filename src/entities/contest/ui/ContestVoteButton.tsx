'use client'

import { tv } from 'tailwind-variants'
import { VoteIcon } from '@/shared/assets'

const contestVoteButtonVariants = tv({
  base: 'flex h-8 items-center justify-center rounded-full px-2 text-sm leading-[1.5] font-semibold text-neutral-850 transition-colors disabled:cursor-not-allowed',
  variants: {
    state: {
      idle: 'bg-point-500 enabled:hover:bg-point-400',
      completed: 'bg-neutral-150 text-neutral-400',
      voted: 'bg-point-600 enabled:hover:bg-point-500',
    },
  },
  defaultVariants: { state: 'idle' },
})

interface ContestVoteButtonProps {
  isVoted: boolean
  hasContestVote: boolean
  onVote?: () => void
  onCancelVote?: () => void
  isPending?: boolean
  isDisabled?: boolean
  className?: string
}

const ContestVoteButton = ({
  isVoted,
  hasContestVote,
  onVote,
  onCancelVote,
  isPending = false,
  isDisabled = false,
  className,
}: ContestVoteButtonProps) => {
  const state = isVoted ? 'voted' : hasContestVote ? 'completed' : 'idle'
  const isCancelUnavailable = state === 'voted' && !onCancelVote
  const disabled = isPending || isDisabled || state === 'completed' || isCancelUnavailable
  const label =
    state === 'voted' ? '투표 취소' : state === 'completed' ? '투표했습니다' : '투표하기'

  return (
    <button
      type="button"
      className={contestVoteButtonVariants({ state, className })}
      onClick={state === 'voted' ? onCancelVote : onVote}
      disabled={disabled}
      aria-label={isPending ? `${label} 처리 중` : label}
      title={isCancelUnavailable ? '투표 취소 기능은 준비 중입니다.' : undefined}
    >
      <span>{isPending ? '처리 중...' : label}</span>
      {state !== 'voted' && <VoteIcon className="size-5 shrink-0" />}
    </button>
  )
}

export { ContestVoteButton }
export type { ContestVoteButtonProps }
