'use client'

import { useEffect, useRef, useState } from 'react'
import { PixelImageIcon } from '@/shared/assets'
import { HelpMessage, ProfileAvatar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
import { useUploadProfileImage } from '../api/onboarding.mutations'
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
          setError(err instanceof Error ? err.message : '이미지를 올리지 못했어요.')
          setPreviewUrl(null)
        },
      },
    )
  }

  const shownImage = previewUrl ?? value?.url

  return (
    // 가운데 아바타 100 — 아바타 자체가 사진 고르기 버튼이고, 오른쪽 아래 배지가 그걸 알려준다
    <div className={cn('flex w-full flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="프로필 사진 선택 (선택)"
        className="group relative rounded-full focus-ring disabled:cursor-wait"
      >
        {/* 사용자가 고른 파일(blob)·CDN URL 모두 표시, 없으면 공통 빈 프로필(갈색 발바닥) */}
        <ProfileAvatar src={shownImage} alt="프로필 미리보기" size="xlarge" />
        {/* 배지 32 를 아바타 원 둘레(45° 지점)에 걸치게 박스 오른쪽 아래 모서리에 붙인다 */}
        <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border border-neutral-150 bg-base-white text-neutral-700 transition-colors group-hover:bg-action-subtle group-active:bg-action-subtle-press">
          <PixelImageIcon className="size-4" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {isPending && <p className="text-[0.75rem] text-neutral-700">업로드 중…</p>}
      {error && <HelpMessage status="error">{error}</HelpMessage>}
    </div>
  )
}

export { ProfileImageUpload }
