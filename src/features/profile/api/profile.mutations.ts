'use client'

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { profileQueries, updateMyProfile } from '@/entities/profile'
import type { UpdateMyProfileRequest } from '@/shared/types'
import { followUser, unfollowUser, removeFollower } from './profile.api'

export const useUpdateMyProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateMyProfileRequest) => updateMyProfile(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileQueries.me().queryKey })
    },
  })
}

/**
 * 팔로우 관계가 바뀌면 프로필 루트뿐 아니라 브리더 루트도 지운다 —
 * 브리더홈의 isFollowing/followerCount 는 breederQueries 쪽 캐시에 있다.
 */
const invalidateFollowCaches = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: profileQueries.all() }),
    qc.invalidateQueries({ queryKey: breederQueries.all() }),
  ])

export const useFollowUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      void invalidateFollowCaches(qc)
    },
  })
}

export const useUnfollowUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      void invalidateFollowCaches(qc)
    },
  })
}

/** 내 팔로워 삭제 (친구 목록 모달의 "삭제") */
export const useRemoveFollower = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => removeFollower(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileQueries.all() })
    },
  })
}
