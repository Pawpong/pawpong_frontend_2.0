'use client'

import { useRef, useState } from 'react'
import { PixelUserIcon } from '@/shared/assets/icons'
import { HelpMessage } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useUploadProfileImage, loadSocialSignupSession } from '@/features/auth'

interface ProfileImageUploadProps {
  /** 업로드 후 받은 파일명/URL (폼 값) */
  value?: string
  /** 업로드 성공 시 호출 (파일 URL 전달) */
  onChange?: (urlOrFileName: string) => void
  className?: string
}

/**
 * 프로필 이미지 업로드
 *
 * 파일 선택 → /api/v2/auth/upload-breeder-profile(범용, tempId 기반) 로 업로드 →
 * 받은 URL 을 onChange 로 폼에 전달한다. 가입 완료(social/complete) 시 profileImage 로 함께 전송됨.
 * (서버 임시저장소에 의존하지 않고 클라이언트가 파일명을 전달 — 배포/재시작과 무관하게 안전)
 */
const ProfileImageUpload = ({ value, onChange, className }: ProfileImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadImage, isPending } = useUploadProfileImage()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))

    const tempId = loadSocialSignupSession()?.tempId
    uploadImage(
      { file, tempId },
      {
        onSuccess: (res) => onChange?.(res.url),
        onError: (err) => {
          setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
          setPreviewUrl(null)
        },
      },
    )
  }

  const shownImage = previewUrl ?? (value?.startsWith('http') ? value : null)

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="flex size-[5rem] items-center justify-center overflow-hidden rounded-full bg-[#a6a6a6] disabled:opacity-60 tab:size-[6.25rem]"
      >
        {shownImage ? (
          // 사용자가 고른 파일(blob)·CDN URL 모두 표시 — next/image는 blob 미지원이라 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownImage} alt="프로필 미리보기" className="size-full object-cover" />
        ) : (
          <PixelUserIcon className="size-[2.5rem] text-white tab:size-[3.5rem]" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {isPending && <p className="text-[0.75rem] text-[#6b6b6b]">업로드 중...</p>}
      {error && <HelpMessage status="error">{error}</HelpMessage>}
    </div>
  )
}

export { ProfileImageUpload }
