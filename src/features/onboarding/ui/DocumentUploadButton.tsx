'use client'

import { useRef, type ChangeEvent } from 'react'
import { AttachmentIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface DocumentUploadButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  /** 파일 선택 시 호출 (선택한 File 전달) */
  onFileSelect?: (file: File) => void
  /** 이미 선택된 파일명 — 있으면 라벨 대신 표시 */
  selectedFileName?: string
  /** 허용 파일 형식 (기본: 이미지·PDF) */
  accept?: string
  className?: string
}

/**
 * 서류 업로드 버튼
 * 클릭 시 숨은 파일 input 을 열어 파일을 선택하고, 선택한 File 을 onFileSelect 로 상위 폼에 전달한다.
 */
const DocumentUploadButton = ({
  label,
  variant = 'primary',
  onFileSelect,
  selectedFileName,
  accept = 'image/*,application/pdf',
  className,
}: DocumentUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 시에도 onChange 발생
    if (file) onFileSelect?.(file)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full items-center gap-[0.75rem] rounded-[1rem] px-[1.25rem] py-[0.9375rem]',
          variant === 'primary'
            ? 'h-[3.5625rem] bg-[#a8a8a8] tab:h-[4.375rem]'
            : 'h-[3.625rem] bg-[#d5d5d5] tab:h-[4.375rem]',
          className,
        )}
      >
        <AttachmentIcon className="size-[1.5rem] shrink-0 text-white" />
        <span className="truncate text-[1rem] leading-[1.375rem] font-semibold text-white">
          {selectedFileName ?? label}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </>
  )
}

export { DocumentUploadButton }
