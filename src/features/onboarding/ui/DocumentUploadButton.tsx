'use client'

import { useRef, type ChangeEvent } from 'react'
import { FileIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface DocumentUploadButtonProps {
  label: string
  /** 파일 선택 시 호출 (선택한 File 전달) */
  onFileSelect?: (file: File) => void
  /** 이미 선택된 파일명 — 있으면 라벨 대신 표시 */
  selectedFileName?: string
  /** 허용 파일 형식 (기본: 이미지·PDF) */
  accept?: string
  className?: string
}

/**
 * 서류 업로드 버튼 (Figma 3134-343413)
 * 클릭 시 숨은 파일 input 을 열어 파일을 선택하고, 선택한 File 을 onFileSelect 로 상위 폼에 전달한다.
 */
const DocumentUploadButton = ({
  label,
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
        // px 20 / py 12 / gap 4 / radius 8 — 아이콘 32 + py 24 = 높이 56
        className={cn(
          'flex w-full items-center gap-1 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-left',
          className,
        )}
      >
        <FileIcon className="size-8 shrink-0 text-neutral-700" />
        <span className="truncate text-base leading-[1.5] font-semibold text-neutral-850">
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
