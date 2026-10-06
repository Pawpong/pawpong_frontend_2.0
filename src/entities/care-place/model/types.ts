export type CarePlaceKind = 'hospital' | 'shelter' | 'cafe'
/** 공공 등록자료(전국 목록)가 있는 종류 — 애견동반카페는 카카오 장소 검색에만 있다 */
export type CareDirectoryKind = Exclude<CarePlaceKind, 'cafe'>

export interface CareCoordinates {
  latitude: number
  longitude: number
}

export interface CarePlace {
  id: string
  name: string
  kind: CarePlaceKind
  category: string
  address: string
  roadAddress: string
  phone: string | null
  latitude: number | null
  longitude: number | null
  distanceMeters: number | null
  placeUrl: string
  directionsUrl: string | null
  referral: { url: string; checkedAt: string; label: string } | null
  locationStatus?: 'place' | 'address' | 'not-found' | 'unavailable'
  registration?: { source: string; url: string; checkedAt: string; jurisdictions: string[] }
  /** 공공데이터의 반려동물 동반 조건 — 공공 동반 카페에만 온다 */
  petPolicy?: {
    sizes: string
    restrictions: string
    indoor: boolean
    outdoor: boolean
    source: string
    checkedAt: string
  }
}

export type MappedCarePlace = CarePlace & CareCoordinates & { markerNumber: number }

export interface CarePlaceSearch extends CareCoordinates {
  kind: CarePlaceKind
  query: string
  radius: number
  scope: 'nearby' | 'keyword' | 'directory'
  region: string
  referralOnly: boolean
}

export interface CarePlacePage {
  places: CarePlace[]
  page: number
  hasMore: boolean
  limited: boolean
  source: 'kakao' | 'animal-go'
  totalCount?: number
  totalPages?: number
  locationUnavailable?: boolean
}

export interface CareDirectorySummary {
  checkedAt: string
  hospitalCount: number
  shelterCount: number
  shelterRegistrations: number
  referralCount: number
  sourceUrls: Record<CareDirectoryKind, string>
  regions: { id: string; label: string }[]
}
