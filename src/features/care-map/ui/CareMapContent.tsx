'use client'

import { RetryButton } from '@/shared/ui'
import dynamic from 'next/dynamic'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { cafe24Proup } from '@/shared/lib/fonts'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import {
  getCareDirectorySummary,
  getCareMapConfig,
  searchCarePlaces,
  type CareCoordinates,
  type CarePlaceKind,
  type MappedCarePlace,
} from '@/entities/care-place'
import { CareMapIcon } from './CareMapIcon'
import { CarePlaceDetails } from './CarePlaceDetails'
import { CareMapGuide } from './CareMapGuide'
import { careLocationFailureMessage, startCareLocation } from '../lib/care-location'
import { inNativeAppWebView } from '@/shared/lib/nativeBridge'
import {
  careSearchReducer,
  createCareSearchState,
  DEFAULT_CARE_CENTER,
  hasCareDirectory,
  type CareSearchAction,
} from '../lib/care-search-state'
import './care-map.css'

const KakaoMapCanvas = dynamic(() => import('./KakaoMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-primary-700">
      지도를 펼치는 중이에요…
    </div>
  ),
})
const KIND_LABEL: Record<CarePlaceKind, string> = {
  hospital: '동물병원',
  shelter: '보호센터',
  cafe: '애견동반카페',
  travel: '여행지',
  stay: '숙소',
}
export function CareMapContent({ initialKind = 'hospital' }: { initialKind?: CarePlaceKind }) {
  const [{ search, page, selectedId, nearbyOrigin }, dispatch] = useReducer(
    careSearchReducer,
    initialKind,
    createCareSearchState,
  )
  const [input, setInput] = useState('')
  const [centerRequest, setCenterRequest] = useState<CareCoordinates | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const viewportCenter = useRef<CareCoordinates>(DEFAULT_CARE_CENTER)
  const cancelLocation = useRef<() => void>(() => {})
  const cancelPendingLocation = useCallback(() => {
    cancelLocation.current()
    setLocating(false)
  }, [])
  useEffect(() => {
    const cancel = startCareLocation(navigator, 'granted-only', {
      onChecking: () => setLocating(true),
      onLocated: (center) => {
        setLocating(false)
        viewportCenter.current = center
        dispatch({ type: 'nearby', center, origin: 'location' })
        setCenterRequest(center)
        setLocationMessage(null)
      },
      onFailure: (reason) => {
        setLocating(false)
        setLocationMessage(careLocationFailureMessage(reason, inNativeAppWebView()))
      },
    })
    cancelLocation.current = cancel
    return () => cancelLocation.current()
  }, [])
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
  const isHospital = search.kind === 'hospital'
  const isShelter = search.kind === 'shelter'
  // 동반 카페·여행지·숙소는 공공 등록자료가 없어 지역(전국 목록) 필터와 등록 수를 보여주지 않는다
  const hasDirectory = hasCareDirectory(search.kind)
  const isDirectory = search.scope === 'directory'
  const regionLabel =
    summary.data?.regions.find((region) => region.id === search.region)?.label ?? '전국'
  const nearbyLabel = nearbyOrigin === 'location' ? '내 위치 주변' : '지도 중심 주변'
  const hasFilters =
    !isDirectory || search.region !== 'all' || !!search.query || search.referralOnly

  const updateSearch = (action: CareSearchAction) => {
    cancelPendingLocation()
    setCenterRequest(null)
    setLocationMessage(null)
    dispatch(action)
  }
  const changeKind = (kind: CarePlaceKind) => {
    updateSearch({ type: 'kind', kind })
  }
  const onSelect = useCallback(
    (id: string) => {
      cancelPendingLocation()
      dispatch({ type: 'select', id })
      requestAnimationFrame(() => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth'
        if (window.matchMedia('(max-width: 1023px)').matches)
          detailRef.current?.scrollIntoView({ behavior, block: 'nearest' })
        else
          listRef.current
            ?.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`)
            ?.scrollIntoView({ behavior, block: 'nearest' })
      })
    },
    [cancelPendingLocation],
  )
  const onCenterChange = useCallback((center: CareCoordinates) => {
    viewportCenter.current = center
  }, [])
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setInput(input.trim())
    updateSearch({ type: 'query', query: input })
  }
  const searchHere = () => {
    updateSearch({ type: 'nearby', center: viewportCenter.current, origin: 'map' })
  }
  const locate = () => {
    cancelPendingLocation()
    cancelLocation.current = startCareLocation(navigator, 'manual', {
      onChecking: () => {
        setLocating(true)
        setLocationMessage(null)
      },
      onLocated: (center) => {
        viewportCenter.current = center
        updateSearch({ type: 'nearby', center, origin: 'location' })
        setCenterRequest(center)
      },
      onFailure: (reason) => {
        setLocating(false)
        setLocationMessage(careLocationFailureMessage(reason, inNativeAppWebView()))
      },
    })
  }

  return (
    <div className="care-map-page mx-auto w-full max-w-[68rem] px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      <FeatureIntro eyebrow="우리 아이 곁에" title="전국 돌봄 지도">
        아플 때 찾아갈 병원, 새 가족을 기다리는 보호소,
        <br className="tab:hidden" /> 함께 떠날 카페·여행지·숙소까지 포퐁에서 가까이 만나보세요.
      </FeatureIntro>
      <div className="care-map-counts" role="group" aria-label="시설 종류 · 전국 등록 시설 수">
        {(['hospital', 'shelter', 'cafe', 'travel', 'stay'] as const).map((kind) => {
          const active = search.kind === kind
          const count =
            kind === 'hospital'
              ? summary.data?.hospitalCount
              : kind === 'shelter'
                ? summary.data?.shelterCount
                : null
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={active}
              onClick={() => changeKind(kind)}
              className={`care-map-category ${active ? 'care-map-category-active' : ''}`}
            >
              <span className="care-map-category-heading">
                <CareMapIcon name={kind} className="size-5 shrink-0" />
                <span className={cafe24Proup.className}>{KIND_LABEL[kind]}</span>
                <span className="care-map-selection" aria-hidden="true">
                  {active ? '✓' : ''}
                </span>
              </span>
              <span className="care-map-count">
                <span className="care-map-count-label">
                  {count !== null
                    ? '전국 등록'
                    : kind === 'cafe'
                      ? '카카오·공공데이터'
                      : '관광공사 동반여행'}
                </span>
                {count === null ? null : count === undefined ? (
                  <span className="care-map-count-label">
                    {summary.isError ? '집계 확인 불가' : '확인 중'}
                  </span>
                ) : (
                  <strong>
                    <span>{count.toLocaleString()}</span>
                    <small>곳</small>
                  </strong>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="care-map-search-panel">
        <div className="care-map-search-fields">
          {hasDirectory && (
            <label className="care-map-region">
              <CareMapIcon name="pin" className="size-4" />
              <select
                aria-label={isShelter ? '보호센터 관할 지역' : '병원 지역'}
                value={isDirectory ? search.region : 'nearby'}
                onChange={(event) => {
                  updateSearch({ type: 'region', region: event.target.value })
                }}
              >
                {!isDirectory && (
                  <option value="nearby" disabled>
                    {nearbyLabel}
                  </option>
                )}
                <option value="all">전국</option>
                {summary.data?.regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <form onSubmit={submitSearch} className="care-map-search">
            <label htmlFor="care-place-search" className="sr-only">
              지역 또는 시설 이름
            </label>
            <input
              id="care-place-search"
              value={input}
              onChange={(event) => {
                cancelPendingLocation()
                setInput(event.target.value)
              }}
              maxLength={80}
              placeholder={`${isHospital ? '병원' : KIND_LABEL[search.kind]} 이름 또는 지역 검색`}
              enterKeyHint="search"
            />
            {(input || search.query) && (
              <button
                type="button"
                onClick={() => {
                  setInput('')
                  updateSearch({ type: 'query', query: '' })
                }}
                className="care-map-icon-button"
                aria-label="검색어 지우기"
              >
                <CareMapIcon name="close" className="size-4" />
              </button>
            )}
            <button type="submit" className={`care-map-search-submit ${cafe24Proup.className}`}>
              검색
            </button>
          </form>
        </div>
        <div className="care-map-filters" role="group" aria-label="검색 범위">
          <span className="care-map-filter-label">검색 범위</span>
          {hasDirectory && (
            <button
              type="button"
              className={`care-map-chip ${isDirectory ? 'care-map-chip-active' : ''}`}
              aria-pressed={isDirectory}
              onClick={() => updateSearch({ type: 'directory' })}
            >
              {regionLabel} 등록
            </button>
          )}
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            aria-pressed={!isDirectory && nearbyOrigin === 'location'}
            className={`care-map-chip ${!isDirectory && nearbyOrigin === 'location' ? 'care-map-chip-active' : ''}`}
          >
            <CareMapIcon name="locate" className="size-4" />
            {locating ? '위치 확인 중…' : '내 주변 찾기'}
          </button>
          {!isDirectory && nearbyOrigin === 'map' && (
            <span className="care-map-scope-status">지도 중심 주변</span>
          )}
          {search.scope === 'nearby' && (
            <select
              aria-label="주변 검색 반경"
              value={search.radius}
              className="care-map-radius"
              onChange={(event) =>
                updateSearch({ type: 'radius', radius: Number(event.target.value) })
              }
            >
              <option value={3000}>3km</option>
              <option value={5000}>5km</option>
              <option value={10000}>10km</option>
              <option value={20000}>20km</option>
            </select>
          )}
        </div>
        {isHospital && (
          <div className="care-map-filters" role="group" aria-label="진료 조건">
            <span className="care-map-filter-label">진료 조건</span>
            <button
              type="button"
              className={`care-map-chip ${!search.referralOnly ? 'care-map-chip-active' : ''}`}
              aria-pressed={!search.referralOnly}
              onClick={() => updateSearch({ type: 'referral', enabled: false })}
            >
              전체 병원
            </button>
            <button
              type="button"
              className={`care-map-chip ${search.referralOnly ? 'care-map-chip-active' : ''}`}
              aria-pressed={search.referralOnly}
              onClick={() => updateSearch({ type: 'referral', enabled: true })}
            >
              2차·의뢰 진료 확인
            </button>
          </div>
        )}
        {hasFilters && (
          <div className="care-map-applied-filters">
            <p role="status">
              {isDirectory ? regionLabel : `${nearbyLabel} ${search.radius / 1000}km`}
              {search.referralOnly ? ' · 2차·의뢰 진료 확인' : ''}
              {search.query ? ` · “${search.query}”` : ''}
            </p>
            <button
              type="button"
              className="care-map-chip"
              onClick={() => {
                setInput('')
                updateSearch({ type: 'reset' })
              }}
            >
              조건 초기화
            </button>
          </div>
        )}
      </div>
      {isHospital && (
        <p className="mb-3 text-xs leading-5 text-primary-700">
          {search.referralOnly
            ? `공식 의뢰 안내를 확인한 ${summary.data ? `전국 ${summary.data.referralCount}곳 중 ` : '병원 중 '}선택한 조건에 맞는 곳이에요. 전체 2차 병원 목록은 아니에요.`
            : '전체 병원에는 일반·전문 진료 병원이 함께 있어요. 의뢰 표시가 없는 병원을 1차로 단정하지 않아요.'}
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
                {isDirectory ? regionLabel : nearbyLabel} {KIND_LABEL[search.kind]}{' '}
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
                  ? `${nearbyOrigin === 'location' ? '확인한 내 위치' : '검색한 지도 중심'}에서 직선 거리순`
                  : '반려동물 진료 가능 여부는 병원에 확인해 주세요'}
            </p>
          </div>
          {result.isError && result.data && (
            <div className="border-b border-neutral-150 bg-point-50 px-4 py-3" role="alert">
              <p className="text-xs leading-5 text-neutral-700">
                새 시설 정보를 불러오지 못했어요. 이전 조회 결과를 표시하고 있어요.
              </p>
              <button
                type="button"
                className="mt-1 text-xs font-semibold text-primary-700 underline underline-offset-4"
                onClick={() => void result.refetch()}
              >
                다시 확인
              </button>
            </div>
          )}
          <div className="max-h-[540px] overflow-y-auto overscroll-contain">
            {result.isPending ? (
              <p className="px-4 py-16 text-center text-sm text-neutral-600" role="status">
                시설 정보와 지도 위치를 찾고 있어요…
              </p>
            ) : result.isError && !result.data ? (
              <div className="px-5 py-12 text-center" role="alert">
                <p className="mb-3 text-sm">시설 정보를 불러오지 못했어요.</p>
                <RetryButton onRetry={() => void result.refetch()} isRetrying={result.isFetching} />
              </div>
            ) : !places?.length ? (
              <div className="px-5 py-12 text-center">
                <CareMapIcon name="pin" className="mx-auto mb-3 size-8 text-primary-300" />
                <p className="text-sm font-semibold">조건에 맞는 시설이 없어요.</p>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  지역을 넓히거나 시설 이름을 다시 검색해 보세요.
                </p>
                {hasDirectory && (
                  <button
                    type="button"
                    className="care-map-button mt-4"
                    onClick={() => {
                      updateSearch({ type: 'region', region: 'all' })
                    }}
                  >
                    전국에서 같은 조건 찾기
                  </button>
                )}
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
                  cancelPendingLocation()
                  dispatch({ type: 'page', page: page - 1 })
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
                  cancelPendingLocation()
                  dispatch({ type: 'page', page: page + 1 })
                }}
              >
                다음
              </button>
            </nav>
          )}
          {result.data?.limited && (
            <p className="border-t border-neutral-150 p-3 text-xs leading-5 text-neutral-600">
              주변 검색은 일부 결과만 제공돼요.{' '}
              {hasDirectory ? '전국 등록 목록이나' : '반경을 줄이거나'} 더 구체적인 지역명으로
              찾아보세요.
            </p>
          )}
        </section>

        <div className="order-1 min-w-0 lap:sticky lap:top-20 lap:order-2">
          <div
            className="care-map-canvas relative h-[340px] overflow-hidden tab:h-[440px] lap:h-[530px]"
            onPointerDownCapture={cancelPendingLocation}
            onWheelCapture={cancelPendingLocation}
            onKeyDownCapture={cancelPendingLocation}
          >
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
                    <RetryButton
                      onRetry={() => void config.refetch()}
                      isRetrying={config.isFetching}
                      aria-label="지도 다시 시도"
                    />
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
            {locationMessage ??
              (isDirectory
                ? isShelter
                  ? '선택한 지자체의 등록 보호센터예요. 실제 시설은 다른 지역에 있을 수 있어요.'
                  : '선택한 지역의 등록 병원이에요. 방문 전 전화로 확인해 주세요.'
                : `${nearbyLabel} 반경 ${search.radius / 1000}km에서 찾아요. 거리는 직선 거리예요.`)}
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
            {selected && (
              <CarePlaceDetails
                place={selected}
                onClose={() => dispatch({ type: 'select', id: null })}
              />
            )}
          </div>
          <div className="mt-4">
            <CareMapGuide kind={search.kind} />
          </div>
        </div>
      </div>
      <footer className="mt-6 border-t border-neutral-150 pt-4 text-[11px] leading-5 text-neutral-600">
        {summary.data && hasCareDirectory(search.kind) && (
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
        {search.kind === 'cafe' && (
          <p>동반 카페: 카카오맵 애견카페 · 한국문화정보원 반려동물 동반 가능 문화시설 데이터</p>
        )}
        {(search.kind === 'travel' || search.kind === 'stay') && (
          <p>여행지·숙소: 한국관광공사 반려동물 동반여행 서비스</p>
        )}
        <p>
          지도·장소 위치: 카카오맵 · 주소가 불명확한 시설은 핀을 표시하지 않아요. 진료·방문·입양·
          반려동물 동반 가능 여부는 전화로 확인해 주세요.
        </p>
      </footer>
    </div>
  )
}
