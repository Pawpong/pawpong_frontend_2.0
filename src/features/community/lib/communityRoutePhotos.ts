import type { CommunityRoutePoint } from '@/shared/types'

export function reindexCommunityRoutePhotos(
  route: CommunityRoutePoint[],
  before: (string | File)[],
  after: (string | File)[],
): CommunityRoutePoint[] {
  return route.map(({ photoIndex, ...point }) => {
    if (photoIndex === undefined) return point
    const photo = before[photoIndex]
    const nextIndex = photo === undefined ? -1 : after.indexOf(photo)
    return nextIndex < 0 ? point : { ...point, photoIndex: nextIndex }
  })
}
