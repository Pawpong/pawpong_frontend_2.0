'use client'

import dynamic from 'next/dynamic'
import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import {
  getCareDirectorySummary,
  getCareMapConfig,
  searchCarePlaces,
  type CareCoordinates,
  type CarePlaceKind,
  type CarePlaceSearch,
  type MappedCarePlace,
} from '@/entities/care-place'
import { CareMapIcon } from './CareMapIcon'
import { CarePlaceDetails } from './CarePlaceDetails'
import { CareMapGuide } from './CareMapGuide'
import './care-map.css'

const KakaoMapCanvas = dynamic(() => import('./KakaoMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-primary-700">
      지도를 펼치는 중이에요…
    </div>
  ),
})
const DEFAULT_CENTER = { latitude: 37.5665, longitude: 126.978 }

export function CareMapContent({ initialKind = 'hospital' }: { initialKind?: CarePlaceKind }) {
  const [search, setSearch] = useState<CarePlaceSearch>({
    ...DEFAULT_CENTER,
    kind: initialKind,
    query: '',
    radius: initialKind === 'shelter' ? 20000 : 5000,
    scope: 'directory',
    region: 'all',
    referralOnly: false,
  })
  const [page, setPage] = useState(1)
  const [input, setInput] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [centerRequest, setCenterRequest] = useState<CareCoordinates | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState(
    '전국 등록 시설을 보여드려요. 지역을 선택하면 더 쉽게 찾을 수 있어요.',
  )
  const viewportCenter = useRef<CareCoordinates>(DEFAULT_CENTER)
  const detailRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const config = useQuery({
    queryKey: ['care-map', 'config'],
    queryFn: ({ signal }) => getCareMapConfig(signal),
    staleTime: 300000,
    retry: 1,
  })
  const summary = useQuery({
    queryKey: ['care-map', 'directory-summary'],
    queryFn: ({ signal }) => getCareDirectorySummary(signal),
    staleTime: 300000,
    retry: 1,
  })
  const result = useQuery({
    queryKey: ['care-places', search, page],
    queryFn: ({ signal }) => searchCarePlaces(search, page, signal),
    // Live place coordinates only belong to the currently displayed result.
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const places = result.data?.places
  const mapped = useMemo(
    () =>
      (places ?? []).flatMap((place, index): MappedCarePlace[] =>
        typeof place.latitude === 'number' && typeof place.longitude === 'number'
          ? [
              {
                ...place,
                latitude: place.latitude,
                longitude: place.longitude,
                markerNumber: index + 1,
              },
            ]
          : [],
      ),
    [places],
  )
  const selected = places?.find((place) => place.id === selectedId)
  const isShelter = search.kind === 'shelter'
  const isDirectory = search.scope === 'directory'
  const regionLabel =
    summary.data?.regions.find((region) => region.id === search.region)?.label ?? '전국'

  const updateSearch = (next: CarePlaceSearch) => {
    setSelectedId(null)
    setCenterRequest(null)
    setPage(1)
    setSearch(next)
  }
  const changeKind = (kind: CarePlaceKind) => {
    setInput('')
    updateSearch({
      ...search,
      kind,
      query: '',
      referralOnly: false,
      radius: kind === 'shelter' ? 20000 : 5000,
      scope: 'directory',
    })
    setLocationMessage(
      kind === 'shelter'
        ? '지역을 고르면 해당 지자체가 등록한 보호센터를 볼 수 있어요.'
        : '일반 진료는 가까운 병원부터, 전문 진료는 의뢰 안내를 확인해 보세요.',
    )
  }
  const onSelect = useCallback((id: string) => {
    setSelectedId(id)
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 1023px)').matches)
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      else
        listRef.current
          ?.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])
  const onCenterChange = useCallback((center: CareCoordinates) => {
    viewportCenter.current = center
  }, [])
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    updateSearch({ ...search, query: input.trim(), scope: 'directory' })
    setLocationMessage('등록된 이름·주소·보호센터 관할 지역에서 검색해요.')
  }
  const searchHere = () => {
    setInput('')
    updateSearch({
      ...search,
      ...viewportCenter.current,
      query: '',
      scope: 'nearby',
      referralOnly: false,
    })
    setLocationMessage('지도 중심에서 가까운 카카오 등록 시설이에요. 거리는 직선 거리예요.')
  }
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('현재 위치를 확인할 수 없어요. 지역을 선택해 주세요.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        if (
          coords.latitude < 32 ||
          coords.latitude > 39 ||
          coords.longitude < 123 ||
          coords.longitude > 133
        ) {
          setLocationMessage('국내 시설을 제공하고 있어요. 찾으실 지역을 선택해 주세요.')
          return
        }
        const center = { latitude: coords.latitude, longitude: coords.longitude }
        viewportCenter.current = center
        setInput('')
        updateSearch({ ...search, ...center, query: '', scope: 'nearby', referralOnly: false })
        setCenterRequest(center)
        setLocationMessage('내 위치에서 가까운 시설이에요. 방문 전 전화로 확인해 주세요.')
      },
      (error) => {
        setLocating(false)
        setLocationMessage(
          error.code === 1
            ? '위치 권한이 꺼져 있어요. 지역을 선택하거나 브라우저에서 위치 권한을 켜 주세요.'
            : '현재 위치를 확인하지 못했어요. 지역을 선택하거나 다시 시도해 주세요.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="care-map-page mx-auto w-full max-w-[68rem] px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      <FeatureIntro eyebrow="우리 아이 곁에" title="전국 돌봄 지도">
        아플 때 찾아갈 병원, 새 가족을 기다리는 보호소.
        <br className="tab:hidden" /> 포퐁에서 가까이 만나보세요.
      </FeatureIntro>
      <div className="mt-4 mb-6">
        {summary.data && (
          <div className="care-map-counts" aria-label="전국 등록 시설 수">
            <button type="button" onClick={() => changeKind('hospital')}>
              <span>동물병원</span>
              <strong>
                {summary.data.hospitalCount.toLocaleString()}
                <small>곳</small>
              </strong>
            </button>
            <span className="h-9 border-l border-primary-100" aria-hidden="true" />
            <button type="button" onClick={() => changeKind('shelter')}>
              <span>보호센터</span>
              <strong>
                {summary.data.shelterCount.toLocaleString()}
                <small>곳</small>
              </strong>
            </button>
          </div>
        )}
      </div>

      <div className="care-map-tabs" role="group" aria-label="시설 종류">
        <button
          type="button"
          aria-pressed={!isShelter}
          onClick={() => changeKind('hospital')}
          className={`care-map-category ${!isShelter ? 'care-map-category-active' : ''}`}
        >
          <CareMapIcon name="hospital" />
          동물병원
        </button>
        <button
          type="button"
          aria-pressed={isShelter}
          onClick={() => changeKind('shelter')}
          className={`care-map-category ${isShelter ? 'care-map-category-active' : ''}`}
        >
          <CareMapIcon name="shelter" />
          유기동물 보호센터
        </button>
      </div>

      <div className="care-map-search-panel">
        <div className="flex flex-wrap items-center gap-2">
          <label className="care-map-region">
            <CareMapIcon name="pin" className="size-4" />
            <select
              aria-label={isShelter ? '보호센터 관할 지역' : '병원 지역'}
              value={search.region}
              onChange={(event) => {
                updateSearch({ ...search, region: event.target.value, scope: 'directory' })
                setLocationMessage(
                  isShelter
                    ? '선택한 지자체의 등록 보호센터예요. 실제 시설은 다른 지역에 있을 수 있어요.'
                    : '선택한 지역의 등록 병원을 보여드려요.',
                )
              }}
            >
              <option value="all">전국</option>
              {summary.data?.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>
          <form onSubmit={submitSearch} className="care-map-search">
            <label htmlFor="care-place-search" className="sr-only">
              지역 또는 시설 이름
            </label>
            <input
              id="care-place-search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={80}
              placeholder={isShelter ? '보호센터 이름 또는 지역 검색' : '병원 이름 또는 지역 검색'}
              enterKeyHint="search"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="care-map-icon-button"
                aria-label="검색어 지우기"
              >
                <CareMapIcon name="close" className="size-4" />
              </button>
            )}
            <Button type="submit" size="md">
              검색
            </Button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`care-map-chip ${isDirectory && !search.referralOnly ? 'care-map-chip-active' : ''}`}
            aria-pressed={isDirectory && !search.referralOnly}
            onClick={() => updateSearch({ ...search, scope: 'directory', referralOnly: false })}
          >
            전국 등록 {isShelter ? '보호센터' : '병원'}
          </button>
          {!isShelter && (
            <button
              type="button"
              className={`care-map-chip ${search.referralOnly ? 'care-map-chip-active' : ''}`}
              aria-pressed={search.referralOnly}
              onClick={() => {
                setInput('')
                updateSearch({
                  ...search,
                  query: '',
                  region: 'all',
                  referralOnly: true,
                  scope: 'directory',
                })
              }}
            >
              2차·의뢰 진료{summary.data ? ` ${summary.data.referralCount}` : ''}
            </button>
          )}
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className={`care-map-chip inline-flex items-center gap-1 ${search.scope === 'nearby' ? 'care-map-chip-active' : ''}`}
          >
            <CareMapIcon name="locate" className="size-4" />
            {locating ? '위치 확인 중…' : '내 주변 찾기'}
          </button>
          {search.scope === 'nearby' && (
            <select
              aria-label="주변 검색 반경"
              value={search.radius}
              className="care-map-radius"
              onChange={(event) =>
                updateSearch({
                  ...search,
                  radius: Number(event.target.value),
                  ...viewportCenter.current,
                })
              }
            >
              <option value={3000}>3km</option>
              <option value={5000}>5km</option>
              <option value={10000}>10km</option>
              <option value={20000}>20km</option>
            </select>
          )}
          <span className="ml-auto hidden text-xs text-neutral-600 tab:inline">
            {isDirectory ? '공식 등록자료로 찾아요' : '카카오 장소 검색'}
          </span>
        </div>
      </div>
      {search.referralOnly && (
        <p className="mb-3 text-xs leading-5 text-primary-700">
          병원 공식 의뢰 안내를 확인한 곳이에요. 전국 모든 2차 병원 목록은 아니며, 표시가 없는
          병원을 1차로 단정하지 않아요.
        </p>
      )}

      <div className="grid gap-4 lap:grid-cols-[350px_minmax(0,1fr)] lap:items-start">
        <section
          className="care-map-results order-2 lap:order-1"
          aria-label="시설 검색 결과"
          aria-busy={result.isFetching}
        >
          <div className="border-b border-neutral-150 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-neutral-850">
                {isDirectory ? regionLabel : '지도 주변'} {isShelter ? '보호센터' : '동물병원'}{' '}
                <span className="text-primary-500">
                  {(result.data?.totalCount ?? places?.length ?? 0).toLocaleString()}
                </span>
              </h2>
              <span className="text-xs text-neutral-600">
                {search.scope === 'nearby' ? `반경 ${search.radius / 1000}km` : '등록 이름순'}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              {isShelter && isDirectory
                ? '관할 지자체 기준 · 공동 보호센터는 한 곳으로 표시'
                : search.scope === 'nearby'
                  ? '지도 중심에서 직선 거리순'
                  : '반려동물 진료 가능 여부는 병원에 확인해 주세요'}
            </p>
          </div>
          <div className="max-h-[540px] overflow-y-auto overscroll-contain">
            {result.isPending ? (
              <p className="px-4 py-16 text-center text-sm text-neutral-600" role="status">
                시설 정보와 지도 위치를 찾고 있어요…
              </p>
            ) : result.isError ? (
              <div className="px-5 py-12 text-center" role="alert">
                <p className="mb-3 text-sm">시설 정보를 불러오지 못했어요.</p>
                <button
                  type="button"
                  className="care-map-button"
                  onClick={() => void result.refetch()}
                >
                  다시 시도
                </button>
              </div>
            ) : !places?.length ? (
              <div className="px-5 py-12 text-center">
                <CareMapIcon name="pin" className="mx-auto mb-3 size-8 text-primary-300" />
                <p className="text-sm font-semibold">조건에 맞는 시설이 없어요.</p>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  지역을 넓히거나 시설 이름을 다시 검색해 보세요.
                </p>
                <button
                  type="button"
                  className="care-map-button mt-4"
                  onClick={() => {
                    setInput('')
                    updateSearch({ ...search, region: 'all', query: '', scope: 'directory' })
                  }}
                >
                  전국에서 찾기
                </button>
              </div>
            ) : (
              <ol ref={listRef} className="divide-y divide-neutral-100">
                {places.map((place, index) => (
                  <li key={place.id} data-place-id={place.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(place.id)}
                      aria-pressed={selectedId === place.id}
                      className={`care-map-place ${selectedId === place.id ? 'care-map-place-selected' : ''}`}
                    >
                      <span className="care-map-list-number">{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-6 font-semibold text-neutral-850">
                          {place.name}
                        </span>
                        {place.referral && <span className="care-map-badge">2차·의뢰 진료</span>}
                        <span className="mt-1 block text-xs leading-5 text-neutral-600">
                          {place.roadAddress || place.address || '공식 등록 주소 미제공'}
                        </span>
                        {search.scope === 'nearby' && place.distanceMeters !== null && (
                          <span className="mt-1 block text-xs text-primary-500">
                            {place.distanceMeters < 1000
                              ? `${place.distanceMeters}m`
                              : `${(place.distanceMeters / 1000).toFixed(1)}km`}
                          </span>
                        )}
                        {place.latitude === null && (
                          <span className="mt-1 block text-[11px] text-neutral-600">
                            지도 위치 확인 필요 · 연락처 보기
                          </span>
                        )}
                      </span>
                      <CareMapIcon name="arrow" className="mt-1 size-4 shrink-0 text-primary-400" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
          {(page > 1 || result.data?.hasMore) && (
            <nav
              className="flex items-center justify-between gap-3 border-t border-neutral-150 p-3"
              aria-label="시설 목록 페이지"
            >
              <button
                type="button"
                className="care-map-button"
                disabled={page === 1 || result.isFetching}
                onClick={() => {
                  setSelectedId(null)
                  setPage(page - 1)
                }}
              >
                이전
              </button>
              <span className="text-xs text-neutral-600">
                {page}
                {result.data?.totalPages ? ` / ${result.data.totalPages}` : ''} 페이지
              </span>
              <button
                type="button"
                className="care-map-button"
                disabled={!result.data?.hasMore || result.isFetching}
                onClick={() => {
                  setSelectedId(null)
                  setPage(page + 1)
                }}
              >
                다음
              </button>
            </nav>
          )}
          {result.data?.limited && (
            <p className="border-t border-neutral-150 p-3 text-xs leading-5 text-neutral-600">
              주변 검색은 일부 결과만 제공돼요. 전국 등록 목록이나 더 구체적인 지역명으로
              찾아보세요.
            </p>
          )}
        </section>

        <div className="order-1 min-w-0 lap:sticky lap:top-20 lap:order-2">
          <div className="care-map-canvas relative h-[340px] overflow-hidden tab:h-[440px] lap:h-[530px]">
            {config.data ? (
              <KakaoMapCanvas
                javascriptKey={config.data.javascriptKey}
                places={mapped}
                selectedId={selectedId}
                centerRequest={centerRequest}
                onSelect={onSelect}
                onCenterChange={onCenterChange}
              />
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center text-sm text-primary-700"
                role="status"
              >
                {config.isError ? (
                  <>
                    <p>지도를 준비하지 못했어요. 시설 목록은 계속 확인할 수 있어요.</p>
                    <button
                      type="button"
                      className="care-map-button"
                      onClick={() => void config.refetch()}
                    >
                      지도 다시 시도
                    </button>
                  </>
                ) : (
                  '우리 아이의 지도를 펼치는 중이에요…'
                )}
              </div>
            )}
            <div className="pointer-events-none absolute top-3 right-3 left-3 z-20 flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={searchHere}
                className="care-map-button pointer-events-auto shadow-sm"
              >
                <CareMapIcon name="search" className="size-4" />이 지역에서 다시 검색
              </button>
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="care-map-button pointer-events-auto shadow-sm"
                aria-label="내 위치 주변 검색"
              >
                <CareMapIcon name="locate" className="size-5" />
              </button>
            </div>
            <div className="pointer-events-none absolute right-3 bottom-9 left-3 z-20 flex justify-center">
              <span className="care-map-caption">
                {result.isPending
                  ? '시설 위치를 확인하고 있어요…'
                  : selected
                    ? selected.latitude === null
                      ? '위치를 확인하지 못했어요. 아래 연락처로 문의해 주세요.'
                      : selected.name
                    : `이 페이지 ${mapped.length}곳 지도 표시 · 핀을 눌러보세요`}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-neutral-600" role="status">
            {locationMessage}
          </p>
          {result.data?.locationUnavailable && (
            <div
              className="mt-2 flex items-center justify-between gap-2 text-xs text-primary-700"
              role="alert"
            >
              <span>
                일부 지도 위치를 불러오지 못했어요. 등록 목록과 연락처는 확인할 수 있어요.
              </span>
              <button
                type="button"
                className="care-map-button shrink-0"
                onClick={() => void result.refetch()}
              >
                위치 다시 확인
              </button>
            </div>
          )}
          <div ref={detailRef} className="mt-3">
            {selected && <CarePlaceDetails place={selected} onClose={() => setSelectedId(null)} />}
          </div>
          <div className="mt-4">
            <CareMapGuide kind={search.kind} />
          </div>
        </div>
      </div>
      <footer className="mt-6 border-t border-neutral-150 pt-4 text-[11px] leading-5 text-neutral-600">
        {summary.data && (
          <p>
            <a
              href={summary.data.sourceUrls[search.kind]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              국가동물보호정보시스템 등록자료 ↗
            </a>{' '}
            · {summary.data.checkedAt} 확인 · 보호센터 등록자료 {summary.data.shelterRegistrations}
            건을 {summary.data.shelterCount}곳으로 정리했어요.
          </p>
        )}
        <p>
          지도·장소 위치: 카카오맵 · 주소가 불명확한 시설은 핀을 표시하지 않아요. 진료·방문·입양
          가능 여부는 전화로 확인해 주세요.
        </p>
      </footer>
    </div>
  )
}
