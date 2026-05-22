'use client'

import { cn } from '@/shared/lib/Cn'
import type { AdoptionStatus } from '@/shared/types'

const BREEDER_STATUS_FILTERS: { id: AdoptionStatus; label: string }[] = [
  { id: 'available', label: '분양가능' },
  { id: 'reserved', label: '예약중' },
  { id: 'completed', label: '분양 완료' },
]

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
      {BREEDER_STATUS_FILTERS.map((filter) => {
        const isActive = activeStatus === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => handleClick(filter.id)}
            className={cn(
              'rounded-full px-2.5 py-1 text-sm font-semibold leading-[1.375rem] whitespace-nowrap',
              isActive
                ? 'bg-text-primary text-white'
                : 'bg-[#e1e1e1] text-text-primary',
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

export { StatusFilterChips }
