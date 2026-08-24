'use client'

import { ChevronDownIcon } from '@/shared/assets'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'

const VISIBILITY_OPTIONS = [
  { id: 'public', label: '전체 공개' },
  { id: 'followers', label: '팔로워 공개' },
  { id: 'private', label: '나만보기' },
] as const

type VisibilityType = (typeof VISIBILITY_OPTIONS)[number]['id']

// '나만보기'는 선택지에서 뺀다. 다만 서버 계약(CommunityPostVisibility)에는 남아 있어
// 기존 private 글을 열었을 때 라벨은 그대로 보여줘야 하므로 목록에서만 제외한다.
const SELECTABLE_OPTIONS = VISIBILITY_OPTIONS.filter((option) => option.id !== 'private')

interface VisibilitySelectProps {
  value: VisibilityType
  onChange: (value: VisibilityType) => void
}

const VisibilitySelect = ({ value, onChange }: VisibilitySelectProps) => {
  const activeLabel = VISIBILITY_OPTIONS.find((o) => o.id === value)?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Figma 1058-47323: 풀 너비 h-45, p-12, radius 8 — Textarea와 같은 테두리 톤 */}
        <button
          type="button"
          className="flex h-[2.8125rem] w-full items-center justify-between rounded-lg border border-neutral-300 bg-white p-3"
        >
          <span className="flex-1 text-left text-sm leading-[1.5] font-medium whitespace-nowrap text-neutral-850">
            {activeLabel}
          </span>
          <ChevronDownIcon className="size-6 text-neutral-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[8rem] rounded-md p-0"
      >
        {SELECTABLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-4 py-2.5 text-sm font-medium ${
              value === option.id ? 'bg-surface-primary text-text-primary' : 'text-text-secondary'
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
