'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Button, InputField } from '@/shared/ui'
import {
  MAX_REPRESENTATIVE_PHOTOS,
  addRepresentativePhotos,
  type PhotoSlot,
} from '../_lib/representativePhotos'

interface RepresentativePhotosFieldProps {
  photos: PhotoSlot[]
  disabled: boolean
  onChange: (photos: PhotoSlot[]) => void
  onError: (error: unknown) => void
}

// 파일이 바뀌거나 슬롯이 사라질 때 미리보기 URL을 해제한다.
function PhotoPreview({ photo, index }: { photo: string | File; index: number }) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  useEffect(() => {
    if (typeof photo === 'string') return
    const url = URL.createObjectURL(photo)
    // 렌더 중 URL을 만들면 Strict Mode의 폐기된 렌더에서 해제할 수 없으므로 effect에서 관리한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview({ file: photo, url })
    return () => URL.revokeObjectURL(url)
  }, [photo])
  const src = typeof photo === 'string' ? photo : preview?.file === photo ? preview.url : null
  if (!src) return null
  return (
    <Image
      src={src}
      alt={`대표사진 ${index + 1}`}
      fill
      sizes="(max-width: 767px) 33vw, 12rem"
      unoptimized={typeof photo !== 'string'}
      className="object-cover"
    />
  )
}

export function RepresentativePhotosField({
  photos: photoSlots,
  disabled,
  onChange,
  onError,
}: RepresentativePhotosFieldProps) {
  const photosInputRef = useRef<HTMLInputElement>(null)
  const selectedSlotRef = useRef(0)
  const choosePhotos = (index = 0) => {
    selectedSlotRef.current = index
    photosInputRef.current?.click()
  }
  const handlePhotosChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length || disabled) return
    try {
      onChange(addRepresentativePhotos(photoSlots, files, selectedSlotRef.current))
    } catch (error) {
      onError(error)
    }
  }
  return (
    <InputField label={`대표사진 (최대 ${MAX_REPRESENTATIVE_PHOTOS}장)`}>
      <input
        ref={photosInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotosChange}
      />
      {/* 기존 사진은 유지하고 선택한 빈 슬롯부터 채운다. */}
      <div className="mb-2 grid grid-cols-3 gap-2">
        {Array.from({ length: MAX_REPRESENTATIVE_PHOTOS }, (_, index) => {
          const photo = photoSlots[index]

          if (!photo) {
            return (
              <button
                key={`empty-${index}`}
                type="button"
                onClick={() => choosePhotos(index)}
                disabled={disabled}
                aria-label="대표사진 추가"
                className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white text-2xl font-medium text-neutral-500 transition-colors hover:border-primary-500 hover:text-primary-500"
              >
                +
              </button>
            )
          }

          return (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg bg-point-50"
            >
              <PhotoPreview photo={photo} index={index} />
              <button
                type="button"
                aria-label={`대표사진 ${index + 1} 빼기`}
                disabled={disabled}
                onClick={() =>
                  onChange(
                    Array.from({ length: MAX_REPRESENTATIVE_PHOTOS }, (_, i) =>
                      i === index ? null : (photoSlots[i] ?? null),
                    ),
                  )
                }
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-neutral-850/60 text-sm font-semibold text-white"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
      <Button
        variant="outline"
        onClick={() => choosePhotos()}
        disabled={disabled || photoSlots.filter(Boolean).length >= MAX_REPRESENTATIVE_PHOTOS}
      >
        사진 더 고르기
      </Button>
      <p className="mt-1 text-[0.625rem] leading-[1.5] font-medium text-neutral-700">
        기존 사진은 유지돼요. 사진을 빼거나 빈 칸에 추가한 뒤 프로필을 적용해주세요. 장당 5MB까지
        올릴 수 있어요.
      </p>
    </InputField>
  )
}
