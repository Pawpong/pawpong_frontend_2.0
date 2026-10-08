import type { CommunityRoutePoint } from '@/shared/types'
import type {
  CommunityPhotoLocation,
  CommunityPhotoLocationOption,
  CommunityPhotoPlacePrecision,
} from '../model/community-photo-location.type'

/** 사진에서 바로 담은 장소의 기본 이름. 사진 순서가 바뀌면 함께 고친다. */
export const communityPhotoPlaceName = (photoIndex: number) => `사진 ${photoIndex + 1}의 장소`
export const UNLINKED_PHOTO_PLACE_NAME = '사진에서 담은 장소'
const AUTO_NAME = /^사진 (\d+)의 장소$/

export function isAutoPhotoPlaceName(name: string, photoIndex?: number) {
  const match = AUTO_NAME.exec(name)
  return !!match && (photoIndex === undefined || Number(match[1]) === photoIndex + 1)
}

// 소수점 둘째 자리는 위도 기준 약 1.1km 격자라 집 앞 위치가 그대로 드러나지 않는다.
export function blurCommunityLocation({ latitude, longitude }: CommunityPhotoLocation) {
  return { latitude: Number(latitude.toFixed(2)), longitude: Number(longitude.toFixed(2)) }
}

export function photoPlaceLocation(
  location: CommunityPhotoLocation,
  precision: CommunityPhotoPlacePrecision,
): CommunityPhotoLocation {
  return precision === 'area' ? blurCommunityLocation(location) : { ...location }
}

export function communityPhotoPlace(
  photo: CommunityPhotoLocationOption,
  precision: CommunityPhotoPlacePrecision,
): CommunityRoutePoint | undefined {
  if (!photo.location) return
  return {
    name: communityPhotoPlaceName(photo.photoIndex),
    ...photoPlaceLocation(photo.location, precision),
    photoIndex: photo.photoIndex,
  }
}

const same = (point: CommunityRoutePoint, location: CommunityPhotoLocation) =>
  point.latitude === location.latitude && point.longitude === location.longitude

/** 연결한 사진의 원래 위치와 비교해 지금 담긴 좌표가 어떤 정밀도인지 알려준다. */
export function photoPlacePrecisionOf(
  point: CommunityRoutePoint,
  photos: CommunityPhotoLocationOption[],
): CommunityPhotoPlacePrecision | undefined {
  const location = photos.find((photo) => photo.photoIndex === point.photoIndex)?.location
  if (point.photoIndex === undefined || !location) return
  if (same(point, location)) return 'exact'
  if (same(point, blurCommunityLocation(location))) return 'area'
}

/** 정밀도를 바꾸면 사진에서 담은 좌표만 새 정밀도로 옮긴다. 직접 옮긴 위치는 건드리지 않는다. */
export function applyPhotoPlacePrecision(
  route: CommunityRoutePoint[],
  photos: CommunityPhotoLocationOption[],
  precision: CommunityPhotoPlacePrecision,
): CommunityRoutePoint[] {
  let changed = false
  const next = route.map((point) => {
    const current = photoPlacePrecisionOf(point, photos)
    const location = photos.find((photo) => photo.photoIndex === point.photoIndex)?.location
    if (!current || current === precision || !location) return point
    changed = true
    return { ...point, ...photoPlaceLocation(location, precision) }
  })
  return changed ? next : route
}

/**
 * 촬영 시각을 아는 사진이 연결된 장소끼리만 시간 순으로 바꾼다.
 * 시각을 모르는 장소는 원래 자리를 지킨다.
 */
export function sortRouteByPhotoTime(
  route: CommunityRoutePoint[],
  photos: CommunityPhotoLocationOption[],
): CommunityRoutePoint[] {
  const timeOf = (point: CommunityRoutePoint) =>
    photos.find((photo) => photo.photoIndex === point.photoIndex)?.takenAt
  const slots = route.flatMap((point, index) => (timeOf(point) === undefined ? [] : [index]))
  if (slots.length < 2) return route
  const ordered = slots
    .map((index) => route[index])
    .sort((a, b) => (timeOf(a) as number) - (timeOf(b) as number))
  if (ordered.every((point, i) => point === route[slots[i]])) return route
  const next = [...route]
  slots.forEach((slot, i) => {
    next[slot] = ordered[i]
  })
  return next
}

export function canSortRouteByPhotoTime(
  route: CommunityRoutePoint[],
  photos: CommunityPhotoLocationOption[],
) {
  return sortRouteByPhotoTime(route, photos) !== route
}
