'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from '@/shared/ui'
import { CameraIcon, LocationPinIcon, PlusIcon } from '@/shared/assets'

// iOS 는 사진을 받는 파일 선택이면 항상 같은 시트(사진 보관함·사진 찍기·파일 선택)를 띄워
// 사진·파일을 나눠도 구분이 안 된다 — 하나로 받고 고른 파일 형식으로 사진/파일 전송을 가른다
const ATTACH_ITEMS = [
  { icon: CameraIcon, label: '사진·파일', type: 'file' },
  { icon: LocationPinIcon, label: '위치 공유', type: 'location' },
] as const

interface ChatAttachMenuProps {
  disabled?: boolean
  onSelectFile: (file: File) => void
  onSelectLocation: () => void
}

const ChatAttachMenu = ({ disabled, onSelectFile, onSelectLocation }: ChatAttachMenuProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onSelectFile(file)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton tone="brandSoft" aria-label="첨부" disabled={disabled}>
            <PlusIcon className="size-5" />
          </IconButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[11rem]">
          {ATTACH_ITEMS.map(({ icon: Icon, label, type }) => (
            <DropdownMenuItem
              key={label}
              className="h-[3.0625rem]"
              onSelect={() => {
                if (type === 'location') onSelectLocation()
                if (type === 'file') fileInputRef.current?.click()
              }}
            >
              <Icon className="size-8 shrink-0" />
              <span className="p-0.5">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleChange} />
    </>
  )
}

export { ChatAttachMenu }
