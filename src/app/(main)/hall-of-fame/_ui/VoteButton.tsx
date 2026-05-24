'use client'

import { tv } from 'tailwind-variants'
import { VoteIcon } from '@/shared/assets/icons'

const voteButtonVariants = tv({
  base: 'flex items-center justify-center gap-[0.625rem] rounded-full px-[0.625rem] py-1',
  variants: {
    voted: {
      true: 'bg-[#a4a4a4]',
      false: 'bg-[#5d5d5d]',
    },
  },
  defaultVariants: { voted: false },
})

interface VoteButtonProps {
  isVoted: boolean
  voteCount: number
  label: string
  className?: string
}

const VoteButton = ({ isVoted, voteCount, label, className }: VoteButtonProps) => {
  return (
    <button
      type="button"
      className={voteButtonVariants({ voted: isVoted, className })}
    >
      <VoteIcon className="size-6 text-white" />
      <span className="text-sm font-semibold leading-[1.375rem] text-white">
        {isVoted ? voteCount : label}
      </span>
    </button>
  )
}

export { VoteButton }
