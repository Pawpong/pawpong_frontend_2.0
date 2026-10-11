import type { CarePlace, CarePlaceFavorite, CarePlaceFavoriteSnapshot } from '@/entities/care-place'

/** 서버가 받는 시설 정보만 골라 보낸다 (의뢰·등록·동반 조건은 저장하지 않는다) */
export const toCarePlaceFavoriteSnapshot = ({
  id,
  kind,
  name,
  category,
  address,
  roadAddress,
  phone,
  latitude,
  longitude,
  placeUrl,
}: CarePlace): CarePlaceFavoriteSnapshot => ({
  id,
  kind,
  name,
  category,
  address,
  roadAddress,
  phone,
  latitude,
  longitude,
  placeUrl,
})

/** 즐겨찾기를 지도 목록·상세가 쓰는 시설 모양으로 — 저장하지 않은 거리·길찾기 링크·의뢰 정보는 비운다 */
export const favoriteToCarePlace = (favorite: CarePlaceFavorite): CarePlace => ({
  ...favorite,
  distanceMeters: null,
  directionsUrl: null,
  referral: null,
})
