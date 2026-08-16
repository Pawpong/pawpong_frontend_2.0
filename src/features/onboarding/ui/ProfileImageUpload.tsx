'use client'

import { useEffect, useRef, useState } from 'react'
import { PawPrintIcon } from '@/shared/assets/icons'
import { Button, HelpMessage } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useUploadProfileImage, loadSocialSignupSession } from '@/features/auth'
import type { UploadedProfileImageFormValue } from '../model/schema'

interface ProfileImageUploadProps {
  /** 업로드 후 받은 파일명/URL (폼 값) */
  value?: UploadedProfileImageFormValue
  /** 업로드 성공 시 가입용 filename과 미리보기 URL을 함께 전달 */
  onChange?: (value: UploadedProfileImageFormValue | undefined) => void
  className?: string
}

/**
 * 프로필 이미지 업로드
 *
 * 파일 선택 → /api/v2/auth/upload-breeder-profile(범용, tempId 기반) 로 업로드 →
 * 가입용 filename과 미리보기 URL을 분리해 폼에 전달한다.
 * (서버 임시저장소에 의존하지 않고 클라이언트가 파일명을 전달 — 배포/재시작과 무관하게 안전)
 */
const ProfileImageUpload = ({ value, onChange, className }: ProfileImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadImage, isPending } = useUploadProfileImage()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(
    () => () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 시에도 onChange 발생
    if (!file) return
    setError(null)
    const nextPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(nextPreviewUrl)

    const tempId = loadSocialSignupSession()?.tempId
    uploadImage(
      { file, tempId },
      {
        onSuccess: (res) => onChange?.({ filename: res.filename, url: res.url }),
        onError: (err) => {
          setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
          setPreviewUrl(null)
        },
      },
    )
  }

  const shownImage = previewUrl ?? value?.url ?? null

  return (
    // 아바타 100 + 버튼 블록(112) 사이 spacing/32 (Figma 3414-752442)
    <div className={cn('flex w-28 flex-col items-center gap-8', className)}>
      <div className="flex size-[5rem] items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-500 tab:size-[6.25rem]">
        {shownImage ? (
          // 사용자가 고른 파일(blob)·CDN URL 모두 표시 — next/image는 blob 미지원이라 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownImage} alt="프로필 미리보기" className="size-full object-cover" />
        ) : (
          <PawPrintIcon className="h-auto w-[67.306%]" />
        )}
      </div>

      {/* 사진 선택 / 기본 프로필 — 버튼 사이 spacing/12 */}
      <div className="flex w-full flex-col items-center gap-3">
        <Button
          variant="fill"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="w-full"
        >
          사진 선택
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setPreviewUrl(null)
            setError(null)
            onChange?.(undefined)
          }}
          className="text-base"
        >
          기본 프로필
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {isPending && <p className="text-[0.75rem] text-neutral-700">업로드 중...</p>}
      {error && <HelpMessage status="error">{error}</HelpMessage>}
    </div>
  )
}

export { ProfileImageUpload }
