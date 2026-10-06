'use client'

import { SharedRouteMap } from '@/features/care-map'
import type { CommunityExperience, CommunityRoutePoint } from '@/shared/types'
import { CommunityClinicSearch } from './CommunityClinicSearch'

const MAX_POINTS = 8

/** 산책 코스·방문 장소 — 작성자가 직접 고른 공개 장소만 담는다. */
export function CommunityRoutePicker({
  value,
  onChange,
  disabled,
}: {
  value: CommunityExperience
  onChange: (patch: Pick<CommunityExperience, 'route' | 'publicPlaceConfirmed'>) => void
  disabled?: boolean
}) {
  const route = value.route
  const full = route.length >= MAX_POINTS
  // 장소가 바뀌면 공개 장소 확인을 다시 받는다.
  const setRoute = (next: CommunityRoutePoint[]) =>
    onChange({ route: next, publicPlaceConfirmed: false })
  return (
    <div className="space-y-3">
      <SharedRouteMap
        points={route}
        onAdd={
          !disabled && !full
            ? (point) => setRoute([...route, { ...point, name: `공개 장소 ${route.length + 1}` }])
            : undefined
        }
      />
      <p className="text-xs leading-relaxed text-neutral-700">
        지도를 눌러 지점을 순서대로 담아요. 최대 {MAX_POINTS}곳이고, 연결선은 실제 길 안내가
        아니에요. 집이나 개인 주소는 담지 마세요.
      </p>
      <CommunityClinicSearch
        label="병원을 찾아 장소로 담기"
        disabled={disabled}
        canPick={(place) => !full && place.latitude !== null && place.longitude !== null}
        onPick={(place) => {
          if (place.latitude === null || place.longitude === null) return
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
            <li key={index} className="flex items-center gap-2">
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
