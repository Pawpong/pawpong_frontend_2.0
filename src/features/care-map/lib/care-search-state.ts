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
      scope: 'directory',
      region: 'all',
      referralOnly: false,
    },
    nearbyOrigin: 'location',
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
