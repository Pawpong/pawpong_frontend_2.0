'use client'

import Image from 'next/image'
import { photoPlacePrecisionOf, type CommunityPhotoLocationOption } from '@/features/community'
import type { CommunityRoutePoint } from '@/shared/types'

/** 담은 장소 한 줄. 목록 상태와 공개 확인 규칙은 CommunityRoutePicker가 갖고 이 줄은 보여주고 알리기만 한다. */
export function CommunityRoutePlaceItem({
  point,
  index,
  count,
  photos,
  disabled,
  onRename,
  onRemove,
  onShow,
  onEditLocation,
  onMove,
  onLinkPhoto,
}: {
  point: CommunityRoutePoint
  index: number
  count: number
  photos: CommunityPhotoLocationOption[]
  disabled?: boolean
  onRename: (name: string) => void
  onRemove: () => void
  onShow: () => void
  onEditLocation: () => void
  onMove: (step: -1 | 1) => void
  onLinkPhoto: (photoIndex: number | undefined) => void
}) {
  const photo = photos.find((option) => option.photoIndex === point.photoIndex)
  const precision = photoPlacePrecisionOf(point, photos)
  return (
    <li className="rounded-xl border border-primary-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-bold text-primary-700"
        >
          {index + 1}
        </span>
        {photo && (
          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
            <Image
              src={photo.previewUrl}
              alt={`${index + 1}번 장소에 연결한 사진 ${photo.photoIndex + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          </span>
        )}
        <input
          aria-label={`${index + 1}번 장소 이름`}
          value={point.name}
          maxLength={60}
          disabled={disabled}
          onChange={(event) => onRename(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring tab:text-sm"
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={`${index + 1}번 장소 빼기`}
          onClick={onRemove}
          className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-neutral-700 focus-ring hover:bg-neutral-50"
        >
          빼기
        </button>
      </div>
      {precision && (
        <p className="mt-1 text-xs text-neutral-700">
          {precision === 'area'
            ? '사진 위치를 동네 정도로 흐려서 담았어요.'
            : '사진 위치 그대로 담았어요.'}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onShow}
          className="min-h-11 rounded-lg px-2 text-xs font-semibold text-primary-700 focus-ring"
        >
          지도에서 보기
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-label={`${index + 1}번 장소 위치 바꾸기`}
          onClick={onEditLocation}
          className="min-h-11 rounded-lg px-2 text-xs font-semibold text-primary-700 focus-ring"
        >
          위치 바꾸기
        </button>
        <button
          type="button"
          disabled={disabled || index === 0}
          aria-label={`${index + 1}번 장소를 앞으로`}
          onClick={() => onMove(-1)}
          className="min-h-11 rounded-lg px-2 text-xs focus-ring disabled:opacity-40"
        >
          앞으로
        </button>
        <button
          type="button"
          disabled={disabled || index === count - 1}
          aria-label={`${index + 1}번 장소를 뒤로`}
          onClick={() => onMove(1)}
          className="min-h-11 rounded-lg px-2 text-xs focus-ring disabled:opacity-40"
        >
          뒤로
        </button>
        {photos.length > 0 && (
          <select
            aria-label={`${index + 1}번 장소에 연결할 사진`}
            value={point.photoIndex ?? ''}
            disabled={disabled}
            onChange={(event) =>
              onLinkPhoto(event.target.value === '' ? undefined : Number(event.target.value))
            }
            className="min-h-11 min-w-0 rounded-lg border border-neutral-200 bg-white px-2 text-xs focus-ring"
          >
            <option value="">사진 연결 안 함</option>
            {photos.map((option) => (
              <option key={option.photoIndex} value={option.photoIndex}>
                사진 {option.photoIndex + 1}
              </option>
            ))}
          </select>
        )}
      </div>
    </li>
  )
}
