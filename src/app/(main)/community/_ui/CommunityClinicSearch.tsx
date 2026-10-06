'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { searchCarePlaces, type CarePlace } from '@/entities/care-place'

/** 돌봄 지도의 병원 검색을 그대로 써서 공개 상호를 고르게 한다. */
export function CommunityClinicSearch({
  label,
  disabled,
  canPick = () => true,
  onPick,
}: {
  label: string
  disabled?: boolean
  canPick?: (place: CarePlace) => boolean
  onPick: (place: CarePlace) => void
}) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<CarePlace[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])

  const search = async () => {
    const keyword = query.trim()
    if (!keyword || searching) return
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    setSearching(true)
    setError('')
    try {
      const response = await searchCarePlaces(
        {
          latitude: 37.5665,
          longitude: 126.978,
          kind: 'hospital',
          query: keyword,
          radius: 20000,
          scope: 'keyword',
          region: '',
          referralOnly: false,
        },
        1,
        controller.signal,
      )
      if (!controller.signal.aborted) setPlaces(response.places)
    } catch {
      if (!controller.signal.aborted) {
        setPlaces(null)
        setError('병원을 찾지 못했어요. 잠시 뒤 다시 찾거나 이름을 직접 적어 주세요.')
      }
    } finally {
      if (active.current === controller) {
        active.current = null
        setSearching(false)
      }
    }
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
          placeholder="지역과 병원 이름"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              void search()
            }
          }}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring tab:text-sm"
        />
        <button
          type="button"
          disabled={disabled || searching || !query.trim()}
          onClick={() => void search()}
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
          찾은 병원이 없어요. 지역 이름을 함께 넣어 보세요.
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
                  setPlaces(null)
                  setQuery('')
                }}
                className="block min-h-11 w-full px-3 py-2 text-left focus-ring-inset hover:bg-secondary-50 disabled:text-neutral-400"
              >
                <span className="block text-sm font-semibold">{place.name}</span>
                <span className="block text-xs text-neutral-600">
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
