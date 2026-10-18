import type { CarePlaceKind } from './types'

/** 돌봄 지도 시설 종류 — 종류 카드와 주소(?kind=) 검사가 같은 순서·목록을 쓴다 */
export const CARE_PLACE_KINDS = [
  'hospital',
  'shelter',
  'cafe',
  'travel',
  'stay',
] as const satisfies readonly CarePlaceKind[]

export const CARE_PLACE_KIND_LABEL: Record<CarePlaceKind, string> = {
  hospital: '동물병원',
  shelter: '보호센터',
  cafe: '애견동반카페',
  travel: '여행지',
  stay: '숙소',
}

export const isCarePlaceKind = (value: unknown): value is CarePlaceKind =>
  CARE_PLACE_KINDS.some((kind) => kind === value)
