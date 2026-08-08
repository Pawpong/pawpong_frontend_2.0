'use client'

import { cn } from '@/shared/lib/cn'
import type { AdoptionStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from '@/entities/adoption'

const ADOPTION_STATUSES: AdoptionStatus[] = ['available', 'reserved', 'completed']

interface StatusFilterChipsProps {
  activeStatus: AdoptionStatus | null
  onStatusChange: (status: AdoptionStatus | null) => void
}

const StatusFilterChips = ({ activeStatus, onStatusChange }: StatusFilterChipsProps) => {
  const handleClick = (status: AdoptionStatus) => {
    onStatusChange(activeStatus === status ? null : status)
  }

  return (
    <div className="flex items-center gap-3 tab:gap-4">
      {ADOPTION_STATUSES.map((status) => {
        const isActive = activeStatus === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => handleClick(status)}
            className={cn(
              'rounded-full px-2.5 py-1 text-sm leading-[1.375rem] font-semibold whitespace-nowrap',
              isActive ? 'bg-text-primary text-white' : 'bg-[#e1e1e1] text-text-primary',
            )}
          >
            {ADOPTION_CARD_STATUS[status].label}
          </button>
        )
      })}
    </div>
  )
}

export { StatusFilterChips }
