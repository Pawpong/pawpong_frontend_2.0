'use client'

import { useRef, type ChangeEvent } from 'react'
import { CheckRoundedIcon, FileIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface DocumentFilePickerProps {
  label: string
  description?: string
  selectedFileName?: string
  accept?: string
  error?: string
  disabled?: boolean
  onFileSelect: (file: File) => void
  className?: string
}

/** 서류 선택을 온보딩·등급 심사에서 함께 쓰는 공용 파일 입력. */
const DocumentFilePicker = ({
  label,
  description,
  selectedFileName,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  error,
  disabled = false,
  onFileSelect,
  className,
}: DocumentFilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onFileSelect(file)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex min-h-14 w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
          'hover:border-primary-300 hover:bg-primary-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60',
          error
            ? 'border-error-500'
            : selectedFileName
              ? 'border-primary-200'
              : 'border-neutral-300',
        )}
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            selectedFileName ? 'bg-primary-50 text-primary-500' : 'bg-neutral-50 text-neutral-700',
          )}
        >
          {selectedFileName ? (
            <CheckRoundedIcon className="size-5" aria-hidden />
          ) : (
            <FileIcon className="size-6" aria-hidden />
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-neutral-850 tab:text-base">{label}</span>
          <span className="truncate text-xs font-medium text-neutral-500 tab:text-sm">
            {selectedFileName || description || 'PDF 또는 이미지 파일을 선택해주세요.'}
          </span>
        </span>

        <span className="shrink-0 text-xs font-semibold text-primary-600 tab:text-sm">
          {selectedFileName ? '변경' : '선택'}
        </span>
      </button>

      {error && (
        <p role="alert" className="px-1 text-xs font-medium text-error-600">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        disabled={disabled}
        accept={accept}
        aria-label={`${label} 파일 선택`}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

export { DocumentFilePicker, type DocumentFilePickerProps }
