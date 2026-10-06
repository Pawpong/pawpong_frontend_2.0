import type {
  CareCoordinates,
  CareDirectoryKind,
  CarePlaceKind,
  CarePlaceSearch,
} from '@/entities/care-place'

export const DEFAULT_CARE_CENTER = { latitude: 37.5665, longitude: 126.978 }

/** 공공 등록자료(전국 목록)가 있는 종류인지 — 동반 카페·여행지·숙소는 주변 검색만 있다 */
export const hasCareDirectory = (kind: CarePlaceKind): kind is CareDirectoryKind =>
  kind === 'hospital' || kind === 'shelter'
export type NearbyOrigin = 'location' | 'map'

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
      // 전국 목록이 없는 종류는 지도 중심 주변 검색으로 시작한다
      scope: hasCareDirectory(kind) ? 'directory' : 'nearby',
      region: 'all',
      referralOnly: false,
    },
    nearbyOrigin: hasCareDirectory(kind) ? 'location' : 'map',
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
      // 전국 목록을 보다가 목록이 없는 종류로 바꾸면 지금 지도 중심 주변 검색으로 옮긴다
      if (!hasCareDirectory(action.kind) && search.scope === 'directory')
        return {
          ...change({ kind: action.kind, referralOnly: false, scope: 'nearby' }),
          nearbyOrigin: 'map',
        }
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
