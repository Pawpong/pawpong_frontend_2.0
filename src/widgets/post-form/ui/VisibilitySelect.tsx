'use client'

import { ChevronDownIcon } from '@/shared/assets/icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'

const VISIBILITY_OPTIONS = [
  { id: 'public', label: '전체공개' },
  { id: 'followers', label: '팔로워 공개' },
  { id: 'private', label: '나만보기' },
] as const

type VisibilityType = (typeof VISIBILITY_OPTIONS)[number]['id']

interface VisibilitySelectProps {
  value: VisibilityType
  onChange: (value: VisibilityType) => void
}

const VisibilitySelect = ({ value, onChange }: VisibilitySelectProps) => {
  const activeLabel = VISIBILITY_OPTIONS.find((o) => o.id === value)?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center rounded-[0.375rem] border border-[#a8a8a8] px-[0.625rem] py-[0.5rem] tab:w-auto tab:border-fill-muted tab:py-[0.25rem]"
        >
          <span className="flex-1 text-left text-sm font-medium text-text-primary">
            {activeLabel}
          </span>
          <ChevronDownIcon className="size-6 text-[#C6C6C6]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[8rem] rounded-md p-0">
        {VISIBILITY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-4 py-2.5 text-sm font-medium ${
              value === option.id
                ? 'bg-surface-primary text-text-primary'
                : 'text-text-secondary'
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { VisibilitySelect, type VisibilityType }
