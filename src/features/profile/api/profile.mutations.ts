'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileQueries } from '@/entities/profile'
import type { UpdateMyProfileRequest } from '@/shared/types'
import { updateMyProfile, followUser, unfollowUser, removeFollower } from './profile.api'

export const useUpdateMyProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateMyProfileRequest) => updateMyProfile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileQueries.me().queryKey })
    },
  })
}

export const useFollowUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileQueries.all() })
    },
  })
}

export const useUnfollowUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileQueries.all() })
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
