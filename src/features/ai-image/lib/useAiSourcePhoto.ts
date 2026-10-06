'use client'

import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '@/shared/api/token'
import { isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { preparePhoto } from '@/shared/lib/preparePhoto'
import { fetchAiImageFile } from './aiImageFile'

export function useAiSourcePhoto({
  sourceJobId,
  enabled,
  generation,
}: {
  sourceJobId?: string
  enabled: boolean
  generation: number
}) {
  const [photo, setPhoto] = useState<{ file: File; url: string; fromArchive: boolean }>()
  const [preparing, setPreparing] = useState(Boolean(sourceJobId && enabled))
  const [error, setError] = useState<string | null>(null)
  const lifetime = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    lifetime.current = controller
    const token = getAccessToken()
    const active = () => !controller.signal.aborted && isAuthSessionCurrent(generation)
    const current = () => active() && getAccessToken() === token

    if (enabled && sourceJobId) {
      // 보관한 결과만 인증해서 가져온다. 생성과 횟수 차감은 만들기 버튼에서 시작한다.
      void (async () => {
        if (!token || !current()) {
          if (active()) setPreparing(false)
          return
        }
        setPreparing(true)
        try {
          const archived = await fetchAiImageFile(sourceJobId, undefined, controller.signal)
          if (!current()) return
          const file = await preparePhoto(archived)
          if (current()) setPhoto({ file, url: URL.createObjectURL(file), fromArchive: true })
        } catch {
          if (current()) setError('AI 사진을 가져오지 못했어요. 다른 사진을 선택해 주세요.')
        } finally {
          if (active()) setPreparing(false)
        }
      })()
    }
    return () => controller.abort()
  }, [sourceJobId, enabled, generation])

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url)
    },
    [photo],
  )

  const selectPhoto = async (file: File) => {
    const controller = lifetime.current
    const token = getAccessToken()
    const active = () =>
      enabled && controller && !controller.signal.aborted && isAuthSessionCurrent(generation)
    const current = () => active() && getAccessToken() === token
    if (preparing || !current()) return false
    setPreparing(true)
    setError(null)
    try {
      const prepared = await preparePhoto(file)
      if (!current()) return false
      setPhoto({ file: prepared, url: URL.createObjectURL(prepared), fromArchive: false })
      return true
    } catch (error) {
      if (current()) setError(error instanceof Error ? error.message : '사진을 준비하지 못했어요.')
      return false
    } finally {
      if (active()) setPreparing(false)
    }
  }

  return { photo, preparing, error, selectPhoto, clearPhoto: () => setPhoto(undefined) }
}
