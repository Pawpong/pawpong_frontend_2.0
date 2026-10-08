'use client'

import { useSyncExternalStore } from 'react'
import Image from 'next/image'
import { COMMUNITY_MAX_ROUTE_POINTS } from '@/entities/community'
import type {
  CommunityPhotoLocationOption,
  CommunityPhotoPlacePrecision,
} from '@/features/community'
import { getNativePlatform, subscribeNativeCapabilities } from '@/shared/lib/nativeBridge'
import { RadioCardGroup } from '@/shared/ui/RadioCardGroup'
import type { CommunityRoutePoint } from '@/shared/types'

const PRECISION_OPTIONS = [
  {
    value: 'area',
    label: '동네 정도로만',
    description: '약 1km 범위로 흐려서 담아요. 집 근처에서 찍은 사진이라면 이쪽이 안전해요.',
  },
  {
    value: 'exact',
    label: '사진 위치 그대로',
    description: '공원·카페처럼 누구나 가는 공개 장소일 때만 골라 주세요.',
  },
]

const takenAtText = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

// 앱 화면에서는 사진 권한이나 기기 설정 때문에 위치가 빠질 수 있어 안내를 더한다.
function useInNativeApp() {
  return useSyncExternalStore(
    subscribeNativeCapabilities,
    () => getNativePlatform() !== null,
    () => false,
  )
}

export function CommunityPhotoPlaces({
  photos,
  route,
  precision,
  onPrecisionChange,
  onAdd,
  disabled,
}: {
  photos: CommunityPhotoLocationOption[]
  route: CommunityRoutePoint[]
  precision: CommunityPhotoPlacePrecision
  onPrecisionChange: (precision: CommunityPhotoPlacePrecision) => void
  onAdd: (photo: CommunityPhotoLocationOption) => void
  disabled?: boolean
}) {
  const inApp = useInNativeApp()
  const located = photos.filter((photo) => photo.location)
  const fresh = photos.filter((photo) => !photo.saved)
  const appHint = inApp && (
    // 앱의 사진 선택기는 기기에 따라 위치 정보를 지워 전달한다. 사진 권한 설정으로 해결되지 않으므로 지도 선택을 안내한다.
    <span className="mt-1 block">
      앱에서 고른 사진은 휴대폰과 사진 선택 방식에 따라 촬영 위치가 빠진 채 전달될 수 있어요. 위치가
      없으면 지도에서 다녀온 장소를 직접 골라 주세요.
    </span>
  )
  if (!photos.length)
    return (
      <p className="text-xs leading-relaxed text-neutral-700">
        사진을 올리면 기기 안에서 촬영 위치를 찾아 후보로 보여드려요. 위치가 없는 사진은 지도에서
        직접 담을 수 있어요.
        {appHint}
      </p>
    )
  const message = located.length
    ? '사진에서 촬영 위치를 찾았어요. 공개할 정도를 고르고 지도에서 확인한 뒤 담아 주세요.'
    : fresh.length
      ? '고른 사진에서 촬영 위치를 찾지 못했어요. 위치를 추측하지 않으니 지도에서 다녀온 장소를 직접 골라 주세요.'
      : '이미 올린 사진은 위치 정보를 지운 사본만 남아 있어 촬영 위치를 다시 읽지 않아요. 필요한 장소는 지도에서 골라 주세요.'
  return (
    <div className="rounded-xl border border-secondary-400 bg-white p-3">
      <h4 className="text-sm font-bold text-primary-700">사진 속 장소 함께 나누기</h4>
      <p className="mt-1 text-xs leading-relaxed text-neutral-700">
        {message} 담은 장소만 글과 함께 공유되고, 사진 파일의 위치·촬영 시각은 올리지 않아요.
        {!located.length && appHint}
      </p>
      {located.length > 0 && (
        <>
          <div className="mt-3">
            <RadioCardGroup
              name="community-photo-precision"
              label="사진 위치를 얼마나 자세히 공개할까요?"
              required={false}
              value={precision}
              options={PRECISION_OPTIONS}
              onChange={(value) => onPrecisionChange(value as CommunityPhotoPlacePrecision)}
            />
          </div>
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
                      alt={`${photo.photoIndex + 1}번째 사진`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-neutral-850">
                      사진 {photo.photoIndex + 1}의 장소
                    </p>
                    {photo.takenAt !== undefined && (
                      <p className="mt-0.5 text-[0.6875rem] leading-4 text-neutral-600">
                        촬영 {takenAtText.format(photo.takenAt)} · 나만 보여요
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={disabled || added || route.length >= COMMUNITY_MAX_ROUTE_POINTS}
                      onClick={() => onAdd(photo)}
                      className="mt-1 min-h-11 w-full rounded-lg bg-secondary-200 px-2 text-xs font-bold text-primary-700 focus-ring disabled:opacity-50"
                    >
                      {added ? '장소에 담았어요' : '지도에 담아 확인하기'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
