import type {
  CareCoordinates,
  CareDirectoryKind,
  CarePlaceKind,
  CarePlaceSearch,
} from '@/entities/care-place'

export const DEFAULT_CARE_CENTER = { latitude: 37.5665, longitude: 126.978 }

/** 주변 검색 반경 선택지(m) — 종류별 시작 반경(5km·20km)을 포함한다 */
export const CARE_RADIUS_OPTIONS = [3000, 5000, 10000, 20000] as const

/** 공공 등록자료(전국 목록)가 있는 종류인지 — 동반 카페·여행지·숙소는 주변 검색만 있다 */
export const hasCareDirectory = (kind: CarePlaceKind): kind is CareDirectoryKind =>
  kind === 'hospital' || kind === 'shelter'
/**
 * 주변 검색의 기준점이 어디서 왔는지.
 * 'default' 는 위치도 못 받고 지도도 움직이지 않은 초기 상태 — 기준점이 서울 시청(DEFAULT_CARE_CENTER)이다.
 * 사용자가 고른 적 없는 기준이라 '지도 중심' 으로 말하면 직접 옮긴 것처럼 읽히므로 따로 구분한다.
 */
export type NearbyOrigin = 'location' | 'map' | 'default'

interface CareSearchState {
  search: CarePlaceSearch
  nearbyOrigin: NearbyOrigin
  page: number
  selectedId: string | null
}

export type CareSearchAction =
  | { type: 'kind'; kind: CarePlaceKind }
  | { type: 'region'; region: string }
  | { type: 'query'; query: string }
  | { type: 'referral'; enabled: boolean }
  | { type: 'radius'; radius: number }
  | { type: 'nearby'; center: CareCoordinates; origin: NearbyOrigin }
  | { type: 'directory' }
  | { type: 'reset' }
  | { type: 'page'; page: number }
  | { type: 'select'; id: string | null }

export function createCareSearchState(kind: CarePlaceKind): CareSearchState {
  return {
    search: {
      ...DEFAULT_CARE_CENTER,
      kind,
      query: '',
      // 보호센터·여행지·숙소는 드문드문 있어 넓게 시작한다
      radius: kind === 'shelter' || kind === 'travel' || kind === 'stay' ? 20000 : 5000,
      // 전국 목록이 없는 종류는 기본 기준점 주변 검색으로 시작한다
      scope: hasCareDirectory(kind) ? 'directory' : 'nearby',
      region: 'all',
      referralOnly: false,
    },
    // 아직 아무 기준도 못 정했다. 위치가 확인되거나 지도를 옮기면 그때 바뀐다.
    nearbyOrigin: 'default',
    page: 1,
    selectedId: null,
  }
}

/** A filter changes only its own condition. Changing results always clears page/selection. */
export function careSearchReducer(
  state: CareSearchState,
  action: CareSearchAction,
): CareSearchState {
  const { search } = state
  const change = (patch: Partial<CarePlaceSearch>): CareSearchState => ({
    ...state,
    search: { ...search, ...patch },
    page: 1,
    selectedId: null,
  })
  switch (action.type) {
    case 'kind':
      // 전국 목록을 보다가 목록이 없는 종류로 바꾸면 주변 검색으로 옮긴다.
      // 기준점은 지금 가진 것을 그대로 쓰므로 출처(nearbyOrigin)도 건드리지 않는다 —
      // 위치를 확인한 뒤 전국 목록을 보던 사람의 기준을 '지도 중심' 으로 덮어쓰면 안 된다.
      if (!hasCareDirectory(action.kind) && search.scope === 'directory')
        return change({ kind: action.kind, referralOnly: false, scope: 'nearby' })
      return change({
        kind: action.kind,
        referralOnly: action.kind === 'hospital' && search.referralOnly,
      })
    case 'region':
      return change({ scope: 'directory', region: action.region })
    case 'query':
      return change({ query: action.query.trim() })
    case 'referral':
      return change({ referralOnly: search.kind === 'hospital' && action.enabled })
    case 'radius':
      // The search anchor is intentionally independent of the visible map viewport.
      return change({ radius: action.radius })
    case 'nearby':
      return { ...change({ ...action.center, scope: 'nearby' }), nearbyOrigin: action.origin }
    case 'directory':
      return change({ scope: 'directory' })
    case 'reset':
      return createCareSearchState(search.kind)
    case 'page':
      return { ...state, page: action.page, selectedId: null }
    case 'select':
      return { ...state, selectedId: action.id }
  }
}
