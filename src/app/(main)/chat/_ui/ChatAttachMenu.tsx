'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { CameraIcon, FileIcon, LocationPinIcon, PlusIcon } from '@/shared/assets/icons'

const ATTACH_ITEMS = [
  { icon: CameraIcon, label: '이미지' },
  { icon: LocationPinIcon, label: '위치 공유' },
  { icon: FileIcon, label: '파일 첨부' },
] as const

interface ChatAttachMenuProps {
  disabled?: boolean
}

const ChatAttachMenu = ({ disabled }: ChatAttachMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="첨부"
          disabled={disabled}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#3e3e3e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-[0.875rem] text-white" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[11rem]">
        {ATTACH_ITEMS.map(({ icon: Icon, label }) => (
          <DropdownMenuItem key={label} className="h-[3.0625rem]">
            <Icon className="size-8 shrink-0" />
            <span className="p-0.5">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ChatAttachMenu }
