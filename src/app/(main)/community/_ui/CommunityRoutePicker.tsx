'use client'

import { useState } from 'react'
import { COMMUNITY_MAX_ROUTE_POINTS } from '@/entities/community'
import { SharedRouteMap } from '@/features/care-map'
import type { CommunityPhotoLocationOption } from '@/features/community'
import type { CommunityExperience, CommunityRoutePoint } from '@/shared/types'
import { CommunityPlaceSearch } from './CommunityPlaceSearch'
import type { CarePlaceKind } from '@/entities/care-place'
import { CommunityPhotoPlaces } from './CommunityPhotoPlaces'

/** 산책 코스·방문 장소 — 작성자가 직접 고른 공개 장소만 담는다. */
export function CommunityRoutePicker({
  value,
  onChange,
  disabled,
  photos = [],
}: {
  value: CommunityExperience
  onChange: (patch: Pick<CommunityExperience, 'route' | 'publicPlaceConfirmed'>) => void
  disabled?: boolean
  photos?: CommunityPhotoLocationOption[]
}) {
  const [focusPoint, setFocusPoint] = useState<CommunityRoutePoint>()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [placeKind, setPlaceKind] = useState<CarePlaceKind>(value.clinic ? 'hospital' : 'travel')
  const route = value.route
  const full = route.length >= COMMUNITY_MAX_ROUTE_POINTS
  // 장소가 바뀌면 공개 장소 확인을 다시 받는다.
  const setRoute = (next: CommunityRoutePoint[]) => {
    setEditingIndex(null)
    onChange({ route: next, publicPlaceConfirmed: false })
  }
  return (
    <div className="space-y-3">
      <CommunityPhotoPlaces
        photos={photos}
        route={route}
        disabled={disabled}
        onAdd={(point) => {
          if (full || disabled) return
          setRoute([...route, point])
          setFocusPoint(point)
        }}
      />
      <SharedRouteMap
        points={route}
        focusPoint={focusPoint}
        onAdd={
          !disabled && (!full || editingIndex !== null)
            ? (point) => {
                setRoute(
                  editingIndex === null
                    ? [...route, { ...point, name: `공개 장소 ${route.length + 1}` }]
                    : route.map((place, index) =>
                        index === editingIndex
                          ? { ...place, latitude: point.latitude, longitude: point.longitude }
                          : place,
                      ),
                )
                setFocusPoint(point)
              }
            : undefined
        }
      />
      {editingIndex !== null && (
        <p role="status" className="rounded-lg bg-secondary-200 p-3 text-sm text-primary-700">
          {editingIndex + 1}번 장소의 새 위치를 지도에서 눌러 주세요.
          <button
            type="button"
            onClick={() => setEditingIndex(null)}
            className="ml-2 min-h-11 rounded px-2 font-bold underline focus-ring"
          >
            위치 변경 취소
          </button>
        </p>
      )}
      <p className="text-xs leading-relaxed text-neutral-700">
        다녀온 장소를 지도에서 누르고 방문한 순서대로 정리해요. 최대 {COMMUNITY_MAX_ROUTE_POINTS}
        곳을 담을 수 있어요. 연결선은 방문 순서이며 실제 걸은 길이나 길 안내는 아니에요.
      </p>
      <label className="flex items-center justify-between gap-2 text-xs font-bold text-neutral-850">
        어떤 곳을 다녀왔나요?
        <select
          value={placeKind}
          disabled={disabled}
          onChange={(event) => setPlaceKind(event.target.value as CarePlaceKind)}
          className="min-h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm focus-ring"
        >
          <option value="travel">공원·여행지</option>
          <option value="cafe">동반 카페</option>
          <option value="stay">동반 숙소</option>
          <option value="hospital">동물병원</option>
          <option value="shelter">보호소</option>
        </select>
      </label>
      <CommunityPlaceSearch
        key={placeKind}
        kind={placeKind}
        label="공개 장소를 찾아 코스에 담기"
        disabled={disabled}
        canPick={(place) => !full && place.latitude !== null && place.longitude !== null}
        onPick={(place) => {
          if (place.latitude === null || place.longitude === null) return
          setFocusPoint({ name: place.name, latitude: place.latitude, longitude: place.longitude })
          setRoute([
            ...route,
            {
              name: place.name.slice(0, 60),
              latitude: Number(place.latitude.toFixed(4)),
              longitude: Number(place.longitude.toFixed(4)),
            },
          ])
        }}
      />
      {route.length > 0 && (
        <ol className="space-y-2">
          {route.map((point, index) => (
            <li key={index} className="rounded-xl border border-primary-100 bg-white p-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-bold text-primary-700"
                >
                  {index + 1}
                </span>
                <input
                  aria-label={`${index + 1}번 장소 이름`}
                  value={point.name}
                  maxLength={60}
                  disabled={disabled}
                  onChange={(event) =>
                    // 이름만 고칠 때는 좌표가 그대로라 확인을 유지한다.
                    onChange({
                      route: route.map((row, i) =>
                        i === index ? { ...row, name: event.target.value } : row,
                      ),
                      publicPlaceConfirmed: value.publicPlaceConfirmed,
                    })
                  }
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring tab:text-sm"
                />
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${index + 1}번 장소 빼기`}
                  onClick={() => setRoute(route.filter((_, i) => i !== index))}
                  className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-neutral-700 focus-ring hover:bg-neutral-50"
                >
                  빼기
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setFocusPoint(point)}
                  className="min-h-11 rounded-lg px-2 text-xs font-semibold text-primary-700 focus-ring"
                >
                  지도에서 보기
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${index + 1}번 장소 위치 바꾸기`}
                  onClick={() => {
                    setEditingIndex(index)
                    setFocusPoint(point)
                  }}
                  className="min-h-11 rounded-lg px-2 text-xs font-semibold text-primary-700 focus-ring"
                >
                  위치 바꾸기
                </button>
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  aria-label={`${index + 1}번 장소를 앞으로`}
                  onClick={() => {
                    const next = [...route]
                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                    setRoute(next)
                  }}
                  className="min-h-11 rounded-lg px-2 text-xs focus-ring disabled:opacity-40"
                >
                  앞으로
                </button>
                <button
                  type="button"
                  disabled={disabled || index === route.length - 1}
                  aria-label={`${index + 1}번 장소를 뒤로`}
                  onClick={() => {
                    const next = [...route]
                    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                    setRoute(next)
                  }}
                  className="min-h-11 rounded-lg px-2 text-xs focus-ring disabled:opacity-40"
                >
                  뒤로
                </button>
                {photos.length > 0 && (
                  <select
                    aria-label={`${index + 1}번 장소에 연결할 사진`}
                    value={point.photoIndex ?? ''}
                    disabled={disabled}
                    onChange={(event) => {
                      const { photoIndex: _photoIndex, ...place } = point
                      const selected = event.target.value
                      onChange({
                        route: route.map((row, i) =>
                          i !== index
                            ? row
                            : selected === ''
                              ? place
                              : { ...place, photoIndex: Number(selected) },
                        ),
                        publicPlaceConfirmed: value.publicPlaceConfirmed,
                      })
                    }}
                    className="min-h-11 min-w-0 rounded-lg border border-neutral-200 bg-white px-2 text-xs focus-ring"
                  >
                    <option value="">사진 연결 안 함</option>
                    {photos.map((photo) => (
                      <option key={photo.photoIndex} value={photo.photoIndex}>
                        사진 {photo.photoIndex + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {route.length > 0 && (
        <label className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={value.publicPlaceConfirmed}
            disabled={disabled}
            onChange={(event) => onChange({ route, publicPlaceConfirmed: event.target.checked })}
            className="mt-1 size-4 shrink-0 accent-primary-700"
          />
          집·개인 주소가 아닌 공개 장소이며, 글의 공개 범위에 따라 함께 보여진다는 것을 확인했어요.
        </label>
      )}
    </div>
  )
}
