'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { CameraIcon, FileIcon, LocationPinIcon, PlusIcon } from '@/shared/assets'

const ATTACH_ITEMS = [
  { icon: CameraIcon, label: '이미지', type: 'image' },
  { icon: LocationPinIcon, label: '위치 공유', type: 'location' },
  { icon: FileIcon, label: '파일 첨부', type: 'file' },
] as const

interface ChatAttachMenuProps {
  disabled?: boolean
  onSelectFile: (file: File, type: 'image' | 'file') => void
}

const ChatAttachMenu = ({ disabled, onSelectFile }: ChatAttachMenuProps) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onSelectFile(file, type)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="첨부"
            disabled={disabled}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-850 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="text-white" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[11rem]">
          {ATTACH_ITEMS.map(({ icon: Icon, label, type }) => (
            <DropdownMenuItem
              key={label}
              className="h-[3.0625rem]"
              disabled={type === 'location'}
              onSelect={() => {
                if (type === 'image') imageInputRef.current?.click()
                if (type === 'file') fileInputRef.current?.click()
              }}
            >
              <Icon className="size-8 shrink-0" />
              <span className="p-0.5">{label}</span>
              {type === 'location' && <span className="ml-auto text-xs">준비 중</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/heif,image/heic"
        className="hidden"
        onChange={(event) => handleChange(event, 'image')}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleChange(event, 'file')}
      />
    </>
  )
}

export { ChatAttachMenu }
