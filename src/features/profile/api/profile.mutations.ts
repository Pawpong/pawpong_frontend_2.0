'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileQueries } from '@/entities/profile'
import type { UpdateMyProfileRequest } from '@/shared/types'
import { updateMyProfile, followUser, unfollowUser } from './profile.api'

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

/**
 * 팔로우 토글 — 낙관적 UI 상태 + follow/unfollow mutation 연결.
 * initialFollowing 은 프로필이 비동기로 로드되므로 변경 시 동기화한다
 * (mutation 성공 시 프로필 무효화→재조회로 서버 상태가 반영된다).
 */
export const useToggleFollow = (userId: string, initialFollowing: boolean) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  // 프로필이 비동기 로드되어 초기값이 바뀌면 서버 상태로 재동기화 (렌더 중 상태 조정 — React 공식 패턴)
  const [seeded, setSeeded] = useState(initialFollowing)
  if (initialFollowing !== seeded) {
    setSeeded(initialFollowing)
    setIsFollowing(initialFollowing)
  }

  const follow = useFollowUser()
  const unfollow = useUnfollowUser()

  const toggleFollow = () => {
    const next = !isFollowing
    setIsFollowing(next)
    if (next) follow.mutate(userId)
    else unfollow.mutate(userId)
  }

  return { isFollowing, toggleFollow, isPending: follow.isPending || unfollow.isPending }
}
