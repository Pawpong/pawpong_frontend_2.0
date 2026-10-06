import type { CareCoordinates, CarePlaceKind, CarePlaceSearch } from '@/entities/care-place'

export const DEFAULT_CARE_CENTER = { latitude: 37.5665, longitude: 126.978 }
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
      radius: kind === 'shelter' ? 20000 : 5000,
      // 애견동반카페는 공공 등록자료(전국 목록)가 없어 지도 중심 주변 검색으로 시작한다
      scope: kind === 'cafe' ? 'nearby' : 'directory',
      region: 'all',
      referralOnly: false,
    },
    nearbyOrigin: kind === 'cafe' ? 'map' : 'location',
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
      // 전국 목록을 보다가 카페로 바꾸면 목록이 없으니 지금 지도 중심 주변 검색으로 옮긴다
      if (action.kind === 'cafe' && search.scope === 'directory')
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
