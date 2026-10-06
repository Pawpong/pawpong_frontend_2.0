'use client'

import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { useAccessToken } from '@/shared/lib/useAccessToken'
import { requestCommunityPostReview } from '../api/communityReview.api'
import { invalidateCommunityPostData } from '../api/community.cache'
import { captureCommunityWriteSession } from './communityWriteSession'

export function useCommunityReviewRequest(postId: string) {
  const token = useAccessToken()
  const client = useQueryClient()
  const inFlight = useRef<AbortController | null>(null)
  useEffect(() => () => inFlight.current?.abort(), [token, postId])
  const request = useMutation({
    retry: false,
    mutationFn: async (consent: boolean) => {
      if (inFlight.current) throw new Error('심사가 진행 중이에요. 잠시 기다려 주세요.')
      const controller = new AbortController()
      inFlight.current = controller
      try {
        const assertCurrent = captureCommunityWriteSession(controller.signal)
        const post = await requestCommunityPostReview(postId, consent, controller.signal)
        assertCurrent()
        inFlight.current = null
        client.setQueryData(communityQueries.detailKey(postId), post)
        await invalidateCommunityPostData(client, postId)
        assertCurrent()
        return post
      } finally {
        if (inFlight.current === controller) inFlight.current = null
      }
    },
  })
  return request
}
