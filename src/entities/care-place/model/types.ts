export type CarePlaceKind = 'hospital' | 'shelter'

export interface CareCoordinates {
  latitude: number
  longitude: number
}

export interface CarePlace extends CareCoordinates {
  id: string
  name: string
  kind: CarePlaceKind
  category: string
  address: string
  roadAddress: string
  phone: string | null
  distanceMeters: number
  placeUrl: string
  directionsUrl: string
  referral: { url: string; checkedAt: string; label: string } | null
}

export interface CarePlaceSearch extends CareCoordinates {
  kind: CarePlaceKind
  query: string
  radius: number
  scope: 'nearby' | 'keyword'
  referralOnly: boolean
}

export interface CarePlacePage {
  places: CarePlace[]
  page: number
  hasMore: boolean
  limited: boolean
  source: 'kakao'
}
