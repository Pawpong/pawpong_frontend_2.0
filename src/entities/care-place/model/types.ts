export type CarePlaceKind = 'hospital' | 'shelter'

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
  sourceUrls: Record<CarePlaceKind, string>
  regions: { id: string; label: string }[]
}
