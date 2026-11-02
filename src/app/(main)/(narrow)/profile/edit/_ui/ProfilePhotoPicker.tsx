'use client'

import { useRef, type ChangeEvent } from 'react'
import { CameraIcon } from '@/shared/assets'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  ProfileAvatar,
} from '@/shared/ui'

interface ProfilePhotoPickerProps {
  src?: string
  isUploading: boolean
  disabled: boolean
  onPick: (file: File) => void
  onRemove: () => void
}

// 사진 오른쪽 아래에 겹친 카메라 버튼 하나로 바꾸고 지운다
export function ProfilePhotoPicker({
  src,
  isUploading,
  disabled,
  onPick,
  onRemove,
}: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const choose = () => inputRef.current?.click()
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 시에도 onChange 발생
    if (file) onPick(file)
  }

  // 버튼은 한 번만 만들고, 지울 사진이 있을 때만 메뉴로 감싼다
  const button = (
    <IconButton
      shape="circle"
      tone="surface"
      size="sm"
      aria-label={
        isUploading ? '사진 올리는 중' : src ? '프로필 사진 바꾸기' : '프로필 사진 올리기'
      }
      disabled={isUploading || disabled}
      onClick={src ? undefined : choose}
    >
      <CameraIcon aria-hidden className="size-5" />
    </IconButton>
  )

  return (
    <div className="relative shrink-0">
      <ProfileAvatar size="xlarge" src={src} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="absolute -right-1 -bottom-1">
        {src ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} collisionPadding={16}>
              <DropdownMenuItem onSelect={choose}>사진 변경</DropdownMenuItem>
              {/* 저장된 사진이나 방금 올린 사진을 지우면 기본 이미지로 돌아간다 */}
              <DropdownMenuItem onSelect={onRemove}>사진 삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // 지울 사진이 없으면 메뉴 없이 바로 사진을 고른다
          button
        )}
      </div>
    </div>
  )
}
