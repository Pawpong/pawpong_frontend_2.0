'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { aiImageQueries, hideAiImageGeneration } from '@/entities/ai-image'
import { isAuthReadSessionCurrent, type AuthReadSession } from '@/shared/lib/authReadSession'
import { fetchAiImageFile, fetchAiSourceFile, saveAiImageFile } from './aiImageFile'
import { setPendingCommunityPhoto } from './pendingCommunityPhoto'

type ArchiveAction = 'save' | 'post' | 'hide'

export function useAiArchiveAction(session: AuthReadSession | null, jobId: string | null) {
  const router = useRouter()
  const client = useQueryClient()
  const active = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState<ArchiveAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(
    () => () => {
      active.current?.abort()
      active.current = null
    },
    [session, jobId],
  )

  const cancel = () => {
    active.current?.abort()
    active.current = null
    setBusy(null)
    setError(null)
  }
  const run = async (action: ArchiveAction, shareComparison = false): Promise<boolean> => {
    if (!session || !jobId || active.current || !isAuthReadSessionCurrent(session)) return false
    const controller = new AbortController()
    active.current = controller
    const current = () =>
      active.current === controller &&
      !controller.signal.aborted &&
      isAuthReadSessionCurrent(session)
    setBusy(action)
    setError(null)
    try {
      if (action === 'hide') {
        await hideAiImageGeneration(jobId, controller.signal, session)
        if (!current()) return false
        await client.invalidateQueries({
          queryKey: aiImageQueries.myGenerations(true, session).queryKey,
        })
        return current()
      }
      const file = await fetchAiImageFile(jobId, undefined, controller.signal)
      if (!current()) return false
      if (action === 'save') {
        await saveAiImageFile(file)
      } else {
        const original = shareComparison
          ? await fetchAiSourceFile(jobId, controller.signal)
          : undefined
        if (!current()) return false
        setPendingCommunityPhoto(file, original, jobId, session)
        router.push('/community/write?source=ai-photo')
      }
      return current()
    } catch {
      if (current())
        setError(
          action === 'hide'
            ? '사진을 보관함에서 지우지 못했어요. 다시 시도해 주세요.'
            : '사진을 가져오지 못했어요. 로그인 상태와 연결을 확인한 뒤 다시 시도해 주세요.',
        )
      return false
    } finally {
      if (active.current === controller) {
        active.current = null
        setBusy(null)
      }
    }
  }
  return { run, cancel, busy, error }
}
