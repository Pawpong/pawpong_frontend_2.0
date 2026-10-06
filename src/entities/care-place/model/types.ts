export type CarePlaceKind = 'hospital' | 'shelter' | 'cafe' | 'travel' | 'stay'
/** 공공 등록자료(전국 목록)가 있는 종류 — 동반 카페·여행지·숙소는 장소 검색에만 있다 */
export type CareDirectoryKind = 'hospital' | 'shelter'

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
  /** 공공데이터의 반려동물 동반 조건 — 출처마다 항목이 달라 라벨/값 목록으로 온다 */
  petPolicy?: {
    details: { label: string; value: string }[]
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
  source: 'kakao' | 'animal-go' | 'visitkorea'
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
