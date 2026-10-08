import type { CommunityRoutePoint } from '@/shared/types'
import {
  communityPhotoPlaceName,
  isAutoPhotoPlaceName,
  UNLINKED_PHOTO_PLACE_NAME,
} from './communityPhotoPlace'

export function reindexCommunityRoutePhotos(
  route: CommunityRoutePoint[],
  before: (string | File)[],
  after: (string | File)[],
): CommunityRoutePoint[] {
  return route.map(({ photoIndex, ...point }) => {
    if (photoIndex === undefined) return point
    const photo = before[photoIndex]
    const nextIndex = photo === undefined ? -1 : after.indexOf(photo)
    // 자동으로 붙인 '사진 N의 장소' 이름은 사진 순서를 따라가게 고친다. 직접 쓴 이름은 유지한다.
    const auto = isAutoPhotoPlaceName(point.name, photoIndex)
    if (nextIndex < 0) return auto ? { ...point, name: UNLINKED_PHOTO_PLACE_NAME } : point
    return {
      ...point,
      name: auto ? communityPhotoPlaceName(nextIndex) : point.name,
      photoIndex: nextIndex,
    }
  })
}
