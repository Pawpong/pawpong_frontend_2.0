'use client'

import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { carePlaceQueries, type CarePlace, type CarePlaceKind } from '@/entities/care-place'

/** 돌봄 지도와 같은 공개 장소 목록에서 방문한 곳을 고른다. */
export function CommunityPlaceSearch({
  label,
  kind = 'hospital',
  disabled,
  canPick = () => true,
  onPick,
}: {
  label: string
  kind?: CarePlaceKind
  disabled?: boolean
  canPick?: (place: CarePlace) => boolean
  onPick: (place: CarePlace) => void
}) {
  const id = useId()
  const noun = kind === 'hospital' ? '병원' : '장소'
  const [query, setQuery] = useState('')
  // 찾기를 누른 검색어만 조회한다. 새 검색어로 바뀌거나 화면을 떠나면 이전 요청은 취소된다.
  const [submitted, setSubmitted] = useState('')
  const result = useQuery({
    ...carePlaceQueries.places(
      {
        latitude: 37.5665,
        longitude: 126.978,
        kind,
        query: submitted,
        radius: 20000,
        scope: 'keyword',
        region: '',
        referralOnly: false,
      },
      1,
    ),
    enabled: submitted !== '',
    retry: false,
    // 새 검색어를 찾는 동안에도 이전 목록을 그대로 둔다
    placeholderData: (previous) => previous,
  })
  const searching = result.isFetching
  const places = submitted && !result.isError ? (result.data?.places ?? null) : null
  const error = result.isError ? '장소 검색을 완료하지 못했어요. 잠시 뒤 다시 시도해 주세요.' : ''

  const search = () => {
    const keyword = query.trim()
    if (!keyword || searching) return
    if (keyword === submitted) void result.refetch()
    else setSubmitted(keyword)
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-neutral-850">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={query}
          disabled={disabled}
          maxLength={50}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={`지역과 ${noun} 이름`}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              search()
            }
          }}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring tab:text-sm"
        />
        <button
          type="button"
          disabled={disabled || searching || !query.trim()}
          onClick={search}
          className="min-h-11 shrink-0 rounded-lg border border-primary-500 bg-white px-4 text-sm font-bold text-primary-700 focus-ring hover:bg-primary-50 disabled:border-neutral-200 disabled:text-neutral-400"
        >
          {searching ? '찾는 중' : '찾기'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-error-500">
          {error}
        </p>
      )}
      {places && places.length === 0 && (
        <p role="status" className="mt-2 text-xs text-neutral-700">
          검색 결과가 없어요. 지역 이름을 함께 넣어 보세요.
        </p>
      )}
      {places && places.length > 0 && (
        <ul className="mt-2 max-h-44 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
          {places.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                disabled={disabled || !canPick(place)}
                onClick={() => {
                  onPick(place)
                  setSubmitted('')
                  setQuery('')
                }}
                className="block min-h-11 w-full px-3 py-2 text-left focus-ring-inset hover:bg-secondary-50 disabled:text-neutral-400"
              >
                <span className="block text-sm font-semibold">{place.name}</span>
                <span className="block text-xs text-neutral-700">
                  {place.roadAddress || place.address}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
