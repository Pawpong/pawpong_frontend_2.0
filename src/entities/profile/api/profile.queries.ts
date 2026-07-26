import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import { getMyProfile, getFavoriteBreeders, getFollowList, type FollowSegment } from './profile.api'

// [refactored] 팔로워/팔로잉 쿼리가 segment만 다르고 동일 — 설정을 한 곳으로
const followListQuery = (
  segment: FollowSegment,
  userId: string,
  enabled: boolean,
  pageSize: number,
) =>
  createInfiniteQuery({
    queryKey: [...profileQueries.all(), segment, userId, pageSize],
    queryFn: (page) => getFollowList(userId, segment, page, pageSize),
    enabled: enabled && !!userId,
    staleTime: STALE_TIME.DEFAULT,
  })

export const profileQueries = {
  all: () => ['profile'] as const,

  me: () =>
    createQuery({
      queryKey: [...profileQueries.all(), 'me'],
      queryFn: () => getMyProfile(),
      staleTime: STALE_TIME.VERY_LONG,
    }),

  /** 친구 목록 모달 — 팔로워 탭 (모달 열릴 때만 enabled) */
  followers: (userId: string, enabled = true, pageSize = 20) =>
    followListQuery('followers', userId, enabled, pageSize),

  /** 친구 목록 모달 — 팔로잉 탭 */
  followings: (userId: string, enabled = true, pageSize = 20) =>
    followListQuery('followings', userId, enabled, pageSize),

  favoriteBreeders: (pageSize = 10) =>
    createInfiniteQuery({
      queryKey: [...profileQueries.all(), 'favoriteBreeders', pageSize],
      queryFn: (page) => getFavoriteBreeders({ page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),
}
