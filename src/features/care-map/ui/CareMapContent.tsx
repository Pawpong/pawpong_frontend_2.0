'use client'

import dynamic from 'next/dynamic'
import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import {
  getCareMapConfig,
  searchCarePlaces,
  type CareCoordinates,
  type CarePlaceKind,
  type CarePlaceSearch,
} from '@/entities/care-place'
import { CareMapIcon } from './CareMapIcon'
import { CarePlaceDetails } from './CarePlaceDetails'
import { CareMapGuide } from './CareMapGuide'
import './care-map.css'

const KakaoMapCanvas = dynamic(() => import('./KakaoMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-secondary-50 text-sm text-primary-700">
      지도를 준비하고 있어요…
    </div>
  ),
})

const DEFAULT_CENTER: CareCoordinates = { latitude: 37.5665, longitude: 126.978 }
const DEFAULT_SEARCH: CarePlaceSearch = {
  ...DEFAULT_CENTER,
  kind: 'hospital',
  query: '',
  radius: 5000,
  scope: 'nearby',
  referralOnly: false,
}

export function CareMapContent({ initialKind = 'hospital' }: { initialKind?: CarePlaceKind }) {
  const [search, setSearch] = useState<CarePlaceSearch>({
    ...DEFAULT_SEARCH,
    kind: initialKind,
    radius: initialKind === 'shelter' ? 20000 : 5000,
  })
  const [input, setInput] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [centerRequest, setCenterRequest] = useState<CareCoordinates | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState(
    '서울시청 주변부터 보여드려요. 지역을 검색하거나 내 위치를 눌러보세요.',
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
  const result = useInfiniteQuery({
    queryKey: ['care-places', search],
    queryFn: ({ pageParam, signal }) => searchCarePlaces(search, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30000,
    retry: 1,
  })
  const places = useMemo(
    () => [
      ...new Map(
        (result.data?.pages.flatMap((page) => page.places) ?? []).map((place) => [place.id, place]),
      ).values(),
    ],
    [result.data],
  )
  const selected = places.find((place) => place.id === selectedId)
  const isShelter = search.kind === 'shelter'
  const limited = result.data?.pages.some((page) => page.limited)

  const updateSearch = (next: CarePlaceSearch) => {
    setSelectedId(null)
    setSearch(next)
  }
  const changeKind = (kind: CarePlaceKind) => {
    updateSearch({
      ...search,
      kind,
      referralOnly: false,
      radius: kind === 'shelter' ? 20000 : 5000,
      scope: search.query ? 'keyword' : 'nearby',
      ...viewportCenter.current,
    })
  }
  const onSelect = useCallback((id: string) => {
    setSelectedId(id)
    requestAnimationFrame(() => {
      const item = listRef.current?.querySelector<HTMLElement>(`[data-place-id="${id}"]`)
      item?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      if (window.matchMedia('(max-width: 1023px)').matches)
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])
  const onCenterChange = useCallback((center: CareCoordinates) => {
    viewportCenter.current = center
  }, [])
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setCenterRequest(null)
    const query = input.trim()
    setLocationMessage(
      query
        ? `‘${query}’ 검색 결과예요. 다른 지역도 자유롭게 찾아보세요.`
        : '지도 중심에서 가까운 시설을 보여드려요.',
    )
    updateSearch({
      ...search,
      query,
      scope: query ? 'keyword' : 'nearby',
      ...viewportCenter.current,
    })
  }
  const searchHere = () => {
    setInput('')
    updateSearch({ ...search, ...viewportCenter.current, query: '', scope: 'nearby' })
    setLocationMessage('지도 중심에서 가까운 시설을 보여드려요. 거리는 직선 거리예요.')
  }
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationMessage('이 환경에서는 위치를 확인할 수 없어요. 지역명으로 검색해 주세요.')
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
          setLocationMessage('국내 시설을 제공하고 있어요. 찾으실 지역명으로 검색해 주세요.')
          return
        }
        const center = { latitude: coords.latitude, longitude: coords.longitude }
        viewportCenter.current = center
        setCenterRequest(center)
        setInput('')
        updateSearch({ ...search, ...center, query: '', scope: 'nearby' })
        setLocationMessage('내 위치를 중심으로 가까운 시설을 보여드려요.')
      },
      (error) => {
        setLocating(false)
        setLocationMessage(
          error.code === 1
            ? '위치 권한이 꺼져 있어요. 지역명으로 검색하거나 브라우저에서 위치 권한을 켜 주세요.'
            : '현재 위치를 확인하지 못했어요. 다시 시도하거나 지역명으로 검색해 주세요.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="care-map-page mx-auto w-full max-w-[68rem] px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      <FeatureIntro eyebrow="우리 아이 곁에" title="우리 동네 돌봄 지도">
        아플 때도, 새로운 가족을 기다릴 때도.
        <br className="tab:hidden" /> 우리 곁의 병원과 보호시설을 찾아보세요.
      </FeatureIntro>

      <div className="mt-8 mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-850">
        <CareMapIcon name="pin" className="size-4 text-primary-500" />
        어떤 곳을 찾고 있나요?
      </div>

      <div className="mb-4 grid gap-3 lap:grid-cols-[auto_1fr]">
        <div
          className="flex min-w-0 gap-1 rounded-xl bg-point-50 p-1"
          role="group"
          aria-label="시설 종류"
        >
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
            보호·입양시설
          </button>
        </div>
        <form
          onSubmit={submitSearch}
          className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-base-white px-3 py-1.5 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500"
        >
          <CareMapIcon name="search" className="size-5 shrink-0 text-primary-500" />
          <label htmlFor="care-place-search" className="sr-only">
            지역 또는 시설 이름
          </label>
          <input
            id="care-place-search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={80}
            placeholder={isShelter ? '지역·보호시설 이름 검색' : '지역·동물병원 이름 검색'}
            className="min-h-10 min-w-0 flex-1 bg-transparent text-base text-neutral-850 outline-none placeholder:text-neutral-600 tab:text-sm"
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

      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-3">
        {!isShelter && (
          <>
            <button
              type="button"
              className={`care-map-chip ${!search.referralOnly ? 'care-map-chip-active' : ''}`}
              aria-pressed={!search.referralOnly}
              onClick={() =>
                updateSearch({
                  ...search,
                  ...viewportCenter.current,
                  referralOnly: false,
                  scope: search.query ? 'keyword' : 'nearby',
                })
              }
            >
              전체 동물병원
            </button>
            <button
              type="button"
              className={`care-map-chip ${search.referralOnly ? 'care-map-chip-active' : ''}`}
              aria-pressed={search.referralOnly}
              onClick={() => {
                setInput('')
                setCenterRequest(null)
                updateSearch({ ...search, query: '', referralOnly: true, scope: 'keyword' })
              }}
            >
              2차·의뢰 진료 안내 확인
            </button>
          </>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs text-neutral-700">
          주변 검색 반경
          <select
            aria-label="주변 검색 반경"
            value={search.radius}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-neutral-850"
            onChange={(event) => {
              setInput('')
              updateSearch({
                ...search,
                radius: Number(event.target.value),
                ...viewportCenter.current,
                query: '',
                scope: 'nearby',
              })
            }}
          >
            <option value={3000}>3km</option>
            <option value={5000}>5km</option>
            <option value={10000}>10km</option>
            <option value={20000}>20km</option>
          </select>
        </label>
      </div>
      {search.referralOnly && (
        <p className="mb-3 text-xs leading-5 text-primary-700">
          공식 진료의뢰 안내를 확인한 일부 병원입니다. 전국 전체 목록은 아니며, 표시되지 않은 병원도
          의뢰 진료를 제공할 수 있어요.
        </p>
      )}

      <div className="grid gap-5 lap:grid-cols-[300px_minmax(0,1fr)] lap:items-start">
        <div className="order-2 flex min-w-0 flex-col gap-3 lap:order-1">
          <div ref={detailRef}>
            {selected && <CarePlaceDetails place={selected} onClose={() => setSelectedId(null)} />}
          </div>
          <section
            className="overflow-hidden rounded-2xl border border-secondary-200 bg-white"
            aria-label="시설 검색 결과"
            aria-busy={result.isFetching}
          >
            <div className="border-b border-secondary-200 px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-neutral-850">
                  {isShelter ? '보호·입양시설' : '동물병원'}{' '}
                  <span className="text-primary-500">{places.length}</span>
                </h2>
                <span className="text-xs text-neutral-700">
                  {search.scope === 'nearby'
                    ? `중심 반경 ${search.radius / 1000}km`
                    : search.query
                      ? '검색어 기준'
                      : '전국 확인된 병원'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-neutral-700">
                {search.scope === 'nearby'
                  ? '검색 중심에서 가까운 순 · 직선 거리'
                  : '지역·시설 이름 검색 결과'}
              </p>
            </div>
            <div className="max-h-[480px] overflow-y-auto overscroll-contain lap:max-h-[540px]">
              {result.isPending ? (
                <p className="px-5 py-12 text-center text-sm text-neutral-700" role="status">
                  주변 시설을 찾고 있어요…
                </p>
              ) : result.isError && !places.length ? (
                <div className="space-y-3 px-5 py-10 text-center" role="alert">
                  <p className="text-sm text-neutral-850">시설 정보를 불러오지 못했어요.</p>
                  <button
                    type="button"
                    className="care-map-button"
                    onClick={() => void result.refetch()}
                  >
                    다시 시도
                  </button>
                </div>
              ) : places.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CareMapIcon name="pin" className="mx-auto mb-3 size-8 text-primary-300" />
                  <p className="text-sm font-semibold text-neutral-850">
                    조건에 맞는 시설을 찾지 못했어요.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-neutral-700">
                    검색 반경을 넓히거나 다른 지역명을 검색해 보세요.
                  </p>
                </div>
              ) : (
                <ol ref={listRef} className="divide-y divide-neutral-100">
                  {places.map((place, index) => (
                    <li key={place.id} data-place-id={place.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(place.id)}
                        aria-pressed={selectedId === place.id}
                        className={`flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-point-50 ${selectedId === place.id ? 'bg-point-50' : ''}`}
                      >
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-bold text-primary-700">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm leading-6 font-semibold text-neutral-850">
                            {place.name}
                          </span>
                          {place.referral && (
                            <span className="my-1 inline-block rounded bg-secondary-100 px-1.5 py-0.5 text-[11px] font-semibold text-primary-700">
                              2차·의뢰 진료
                            </span>
                          )}
                          <span className="mt-1 block text-xs leading-5 text-neutral-700">
                            {place.roadAddress || place.address}
                          </span>
                          {search.scope === 'nearby' && (
                            <span className="mt-1 block text-xs font-medium text-primary-500">
                              {place.distanceMeters < 1000
                                ? `${place.distanceMeters}m`
                                : `${(place.distanceMeters / 1000).toFixed(1)}km`}
                            </span>
                          )}
                        </span>
                        <CareMapIcon
                          name="arrow"
                          className="mt-1 size-4 shrink-0 text-primary-300"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              {result.isFetchNextPageError && (
                <p className="px-4 py-2 text-center text-xs text-red-700" role="alert">
                  추가 결과를 불러오지 못했어요. 다시 눌러 주세요.
                </p>
              )}
              {result.hasNextPage && (
                <div className="p-3">
                  <button
                    type="button"
                    disabled={result.isFetchingNextPage}
                    onClick={() => void result.fetchNextPage()}
                    className="care-map-button w-full"
                  >
                    {result.isFetchingNextPage ? '불러오는 중…' : '시설 더 보기'}
                  </button>
                </div>
              )}
            </div>
            {limited && (
              <p className="border-t border-secondary-200 px-4 py-3 text-[11px] leading-5 text-neutral-700">
                결과가 많은 지역은 일부만 표시돼요. 지도를 옮기거나 검색어를 구체적으로 입력해
                주세요.
              </p>
            )}
          </section>
        </div>

        <div className="order-1 min-w-0 lap:sticky lap:top-20 lap:order-2">
          <div className="relative h-[350px] overflow-hidden rounded-2xl border border-secondary-200 bg-secondary-50 tab:h-[460px] lap:h-[640px]">
            {config.data ? (
              <KakaoMapCanvas
                javascriptKey={config.data.javascriptKey}
                places={places}
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
                  '우리 동네 지도를 펼치는 중이에요…'
                )}
              </div>
            )}
            <div className="pointer-events-none absolute top-4 right-4 left-4 z-20 flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={searchHere}
                className="care-map-button pointer-events-auto bg-white shadow-sm"
              >
                <CareMapIcon name="search" className="size-4" />이 지역에서 다시 검색
              </button>
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="care-map-button pointer-events-auto bg-white shadow-sm"
                aria-label="내 위치 주변 검색"
              >
                <CareMapIcon name="locate" className="size-5" />
                <span className="hidden tab:inline">{locating ? '확인 중…' : '내 위치'}</span>
              </button>
            </div>
            <div className="pointer-events-none absolute right-3 bottom-9 left-3 z-20 flex justify-center">
              <span className="rounded-full bg-white/95 px-3 py-2 text-[11px] text-primary-700 shadow-sm">
                {selected
                  ? `선택한 시설: ${selected.name}`
                  : '숫자 핀이나 목록을 누르면 상세 정보를 볼 수 있어요'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-neutral-700" role="status">
            {locationMessage}
          </p>
          <div className="mt-4">
            <CareMapGuide kind={search.kind} />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-neutral-700">
            지도·장소 정보 제공: 카카오맵 · 영업시간과 진료·입양 가능 여부는 시설에 직접 확인해
            주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
