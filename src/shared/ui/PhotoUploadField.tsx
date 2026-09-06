'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import { CameraIcon, CloseIcon } from '@/shared/assets'
import { PHOTO_ACCEPT } from '@/shared/lib/preparePhoto'
import { cn } from '@/shared/lib/cn'
import { Button } from './Button'

interface PhotoUploadFieldProps {
  preview?: string
  disabled?: boolean
  processing?: boolean
  onSelect: (files: FileList) => void
  onRemove: () => void
}

/** Single-photo selection with replacement, keyboard access and desktop drop support. */
export function PhotoUploadField({
  preview,
  disabled,
  processing,
  onSelect,
  onRemove,
}: PhotoUploadFieldProps) {
  const input = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [dragging, setDragging] = useState(false)
  const busy = disabled || processing
  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!busy) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!busy) onSelect(event.dataTransfer.files)
        }}
        className={cn(
          'relative overflow-hidden rounded-xl border bg-point-50 transition-colors',
          dragging ? 'border-primary-500 bg-point-100' : 'border-primary-200',
        )}
        aria-busy={processing}
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          aria-label={preview ? '사진 바꾸기' : '참여 사진 선택'}
          aria-describedby={hintId}
          className="relative flex aspect-square w-full flex-col items-center justify-center gap-4 p-6 text-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary-500 disabled:cursor-wait"
        >
          {preview ? (
            <Image
              src={preview}
              alt="콘테스트 참여 사진 미리보기"
              fill
              unoptimized
              sizes="(min-width: 1440px) 420px, (min-width: 768px) 340px, calc(100vw - 80px)"
              className="object-contain"
            />
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-white text-primary-500">
                <CameraIcon className="size-8" />
              </span>
              <span className="text-base font-semibold text-primary-700">
                가장 사랑스러운 순간을 담아주세요
              </span>
              <span className="text-sm text-neutral-700">사진을 선택하거나 여기에 놓아주세요</span>
              <span className="rounded-full bg-point-500 px-6 py-2.5 text-sm font-semibold text-neutral-850">
                사진 선택하기
              </span>
            </>
          )}
        </button>
        {preview && !busy && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="선택한 사진 삭제"
            className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-neutral-150 bg-white text-neutral-850 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
        {processing && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm font-semibold text-primary-700"
          >
            사진을 준비하고 있어요…
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={PHOTO_ACCEPT}
        disabled={busy}
        aria-label="참여 사진 파일"
        className="hidden"
        onChange={(event) => {
          const files = event.target.files
          if (files?.length) onSelect(files)
          event.target.value = ''
        }}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p id={hintId} className="text-xs leading-relaxed text-neutral-700">
          사진 1장 · 최대 100MB
          <br />
          JPG, PNG, WEBP, GIF, AVIF, HEIC·HEIF
        </p>
        {preview && (
          <Button
            variant="text"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="min-h-11 shrink-0 px-3"
          >
            사진 바꾸기
          </Button>
        )}
      </div>
    </div>
  )
}
