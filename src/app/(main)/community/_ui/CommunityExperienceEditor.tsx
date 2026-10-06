'use client'
import { useState } from 'react'
import { searchCarePlaces, type CarePlace } from '@/entities/care-place'
import { SharedRouteMap } from '@/features/care-map'
import type { CommunityExperience, CommunityExperienceConfig } from '@/entities/community'
import { Button } from '@/shared/ui'
const empty: CommunityExperience = {
  topics: [],
  question: false,
  route: [],
  publicPlaceConfirmed: false,
}
export function CommunityExperienceEditor({
  value = empty,
  onChange,
  config,
  disabled,
}: {
  value?: CommunityExperience | null
  onChange: (value: CommunityExperience) => void
  config: CommunityExperienceConfig
  disabled: boolean
}) {
  const current = value ?? empty
  const [showMap, setShowMap] = useState(current.route.length > 0)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<CarePlace[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const update = (patch: Partial<CommunityExperience>) => onChange({ ...current, ...patch })
  const search = async () => {
    if (!query.trim() || searching) return
    setSearching(true)
    setError('')
    try {
      const response = await searchCarePlaces(
        {
          latitude: 37.5665,
          longitude: 126.978,
          kind: 'hospital',
          query: query.trim(),
          radius: 20000,
          scope: 'keyword',
          region: '',
          referralOnly: false,
        },
        1,
      )
      setPlaces(response.places)
    } catch {
      setError('병원 장소를 찾지 못했어요. 지도에서 직접 선택할 수도 있어요.')
    } finally {
      setSearching(false)
    }
  }
  return (
    <fieldset
      disabled={disabled}
      className="space-y-5 rounded-xl border border-primary-200 bg-point-50 p-5"
    >
      <legend className="text-sm font-bold">우리 아이 경험을 더 잘 찾을 수 있게</legend>
      <div>
        <p className="mb-2 text-sm font-bold">주제 선택 · 최대 3개</p>
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
          {config.topics.map((topic) => {
            const selected = current.topics.includes(topic.key)
            return (
              <button
                key={topic.key}
                type="button"
                aria-pressed={selected}
                disabled={!selected && current.topics.length >= 3}
                onClick={() =>
                  update({
                    ...(topic.key === 'question' ? { question: !selected } : {}),
                    topics: selected
                      ? current.topics.filter((key) => key !== topic.key)
                      : [...current.topics, topic.key],
                  })
                }
                className={
                  selected
                    ? 'rounded-lg border border-primary-500 bg-white px-3 py-2 text-xs font-bold text-primary-700'
                    : 'rounded-lg border border-neutral-150 bg-white px-3 py-2 text-xs'
                }
              >
                {topic.label}
              </button>
            )
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={current.question}
          onChange={(event) =>
            update({
              question: event.target.checked,
              ...(!event.target.checked
                ? { topics: current.topics.filter((topic) => topic !== 'question') }
                : {}),
            })
          }
        />
        질문으로 올리기{config.aiEnabled ? ' · 게시 후 AI 참고 답변 요청 가능' : ''}
      </label>
      <div>
        <Button intent="secondary" size="sm" onClick={() => setShowMap(!showMap)}>
          {showMap ? '지도 접기' : '산책 코스·방문 장소 담기'}
        </Button>
        <p className="mt-2 text-xs leading-5">
          집이나 개인 주소는 선택하지 마세요. GPS를 추적하지 않고 직접 고른 공개 장소만 공유해요.
          사진은 기존 사진 첨부에서 함께 담을 수 있어요.
        </p>
      </div>
      {showMap && (
        <div className="space-y-3">
          <SharedRouteMap
            points={current.route}
            onAdd={
              !disabled && current.route.length < 8
                ? (point) =>
                    update({
                      route: [
                        ...current.route,
                        { ...point, name: `공개 장소 ${current.route.length + 1}` },
                      ],
                      publicPlaceConfirmed: false,
                    })
                : undefined
            }
          />
          <p className="text-xs">
            지도에서 산책 지점을 순서대로 누르세요. 최대 8곳이며 연결선은 실제 길찾기 경로가
            아니에요.
          </p>
          <div className="flex gap-2">
            <input
              aria-label="방문 병원 장소 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="지역과 병원 이름으로 장소 찾기"
              maxLength={50}
              className="min-w-0 flex-1 rounded border border-neutral-200 bg-white p-2 text-sm"
            />
            <Button
              size="sm"
              intent="secondary"
              disabled={searching || !query.trim()}
              onClick={() => void search()}
            >
              {searching ? '검색 중' : '병원 찾기'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-error-500">
              {error}
            </p>
          )}
          {places.length > 0 && (
            <ul className="max-h-36 overflow-y-auto">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    disabled={
                      current.route.length >= 8 ||
                      place.latitude === null ||
                      place.longitude === null
                    }
                    className="w-full p-2 text-left text-xs"
                    onClick={() => {
                      if (place.latitude !== null && place.longitude !== null)
                        update({
                          route: [
                            ...current.route,
                            {
                              name: place.name,
                              latitude: Number(place.latitude.toFixed(4)),
                              longitude: Number(place.longitude.toFixed(4)),
                            },
                          ],
                          publicPlaceConfirmed: false,
                        })
                      setPlaces([])
                    }}
                  >
                    {place.name} · {place.roadAddress || place.address}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ol className="space-y-2">
            {current.route.map((point, index) => (
              <li key={index} className="flex gap-2">
                <input
                  aria-label={`${index + 1}번 장소 이름`}
                  value={point.name}
                  maxLength={60}
                  onChange={(event) =>
                    update({
                      route: current.route.map((row, i) =>
                        i === index ? { ...row, name: event.target.value } : row,
                      ),
                    })
                  }
                  className="min-w-0 flex-1 rounded border border-neutral-200 bg-white p-2 text-sm"
                />
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={() =>
                    update({
                      route: current.route.filter((_, i) => i !== index),
                      publicPlaceConfirmed: false,
                    })
                  }
                >
                  삭제
                </Button>
              </li>
            ))}
          </ol>
          {current.route.length > 0 && (
            <label className="flex items-start gap-2 text-xs leading-5">
              <input
                type="checkbox"
                checked={current.publicPlaceConfirmed}
                onChange={(event) => update({ publicPlaceConfirmed: event.target.checked })}
              />
              집·개인 주소가 아닌 공개 장소이며, 글의 공개 범위에 따라 공유됨을 확인했어요.
            </label>
          )}
        </div>
      )}
      <p className="text-xs leading-5">
        진료 경험을 공유할 때 보호자의 이름·전화번호·진료기록 개인정보를 사진과 본문에서 가려주세요.
        AI 답변에는 사진이나 지도 좌표를 보내지 않아요.
      </p>
    </fieldset>
  )
}
