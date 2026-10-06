'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccessToken } from '@/shared/lib/useAccessToken'
import type { CommunityPostFormInput } from '../model/community-post-form.type'
import { submitCommunityPostForm } from './submitCommunityPostForm'
import { captureCommunityWriteSession } from './communityWriteSession'
import { invalidateCommunityPostData, invalidateCommunityPostLists } from '../api/community.cache'

export const useSubmitCommunityPostForm = (postId?: string) => {
  const token = useAccessToken()
  const client = useQueryClient()
  const mounted = useRef(true)
  const inFlight = useRef<AbortController | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: ({ input, signal }: { input: CommunityPostFormInput; signal: AbortSignal }) =>
      submitCommunityPostForm(input, postId, signal),
    retry: false,
  })
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      inFlight.current?.abort()
    }
  }, [token])
  const submit = async (input: CommunityPostFormInput) => {
    if (inFlight.current || !mounted.current) return null
    const controller = new AbortController()
    inFlight.current = controller
    setError(null)
    try {
      const assertCurrent = captureCommunityWriteSession(controller.signal)
      const post = await mutation.mutateAsync({ input, signal: controller.signal })
      assertCurrent()
      if (!mounted.current) return null
      await (postId
        ? invalidateCommunityPostData(client, postId)
        : invalidateCommunityPostLists(client))
      assertCurrent()
      return mounted.current ? post : null
    } catch (err) {
      if (mounted.current && !controller.signal.aborted)
        setError(
          err instanceof Error ? err.message : '게시글 저장에 실패했습니다. 다시 확인해 주세요.',
        )
      return null
    } finally {
      if (inFlight.current === controller) inFlight.current = null
    }
  }
  return { submit, isSubmitting: mutation.isPending, error }
}
