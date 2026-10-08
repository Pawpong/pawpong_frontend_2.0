'use client'

import Image from 'next/image'
import { COMMUNITY_MAX_ROUTE_POINTS } from '@/entities/community'
import type { CommunityPhotoLocationOption } from '@/features/community'
import type { CommunityRoutePoint } from '@/shared/types'

export function CommunityPhotoPlaces({
  photos,
  route,
  onAdd,
  disabled,
}: {
  photos: CommunityPhotoLocationOption[]
  route: CommunityRoutePoint[]
  onAdd: (point: CommunityRoutePoint) => void
  disabled?: boolean
}) {
  const located = photos.filter((photo) => photo.location)
  if (!photos.length)
    return (
      <p className="text-xs leading-relaxed text-neutral-700">
        사진을 올리면 촬영한 장소를 찾아드려요. 위치가 없는 사진은 지도에서 직접 담을 수 있어요.
      </p>
    )
  return (
    <div className="rounded-xl border border-secondary-400 bg-white p-3">
      <h4 className="text-sm font-bold text-primary-700">사진 속 장소 함께 나누기</h4>
      <p className="mt-1 text-xs leading-relaxed text-neutral-700">
        {located.length
          ? '사진에서 촬영 위치를 찾았어요. 지도로 확인한 뒤 코스에 담아 주세요.'
          : '이 사진에는 촬영 위치가 없어요. 지도에서 다녀온 장소를 직접 선택해 주세요.'}{' '}
        선택한 장소만 글과 함께 공유돼요.
      </p>
      {located.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 tab:grid-cols-3">
          {located.map((photo) => {
            const added = route.some((point) => point.photoIndex === photo.photoIndex)
            return (
              <li
                key={photo.photoIndex}
                className="overflow-hidden rounded-lg border border-neutral-200"
              >
                <div className="relative aspect-[4/3] bg-neutral-50">
                  <Image
                    src={photo.previewUrl}
                    alt={`${photo.photoIndex + 1}번째 사진의 촬영 장소`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-neutral-850">
                    사진 {photo.photoIndex + 1}의 장소
                  </p>
                  <button
                    type="button"
                    disabled={disabled || added || route.length >= COMMUNITY_MAX_ROUTE_POINTS}
                    onClick={() =>
                      photo.location &&
                      onAdd({
                        name: `사진 ${photo.photoIndex + 1}의 장소`,
                        ...photo.location,
                        photoIndex: photo.photoIndex,
                      })
                    }
                    className="mt-1 min-h-11 w-full rounded-lg bg-secondary-200 px-2 text-xs font-bold text-primary-700 focus-ring disabled:opacity-50"
                  >
                    {added ? '코스에 담았어요' : '지도에 담아 확인하기'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
