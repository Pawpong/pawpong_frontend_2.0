'use client'

import { useEffect, useRef, useState } from 'react'
import { getAiImageGenerationSourceImage } from '@/entities/ai-image'
import { preparePhoto } from '@/shared/lib/preparePhoto'
import type { CommunityAiComparison } from '@/shared/types'
import {
  prepareComparisonPost,
  type ComparisonPhoto,
  type PostAiComparisonChoice,
} from './postAiComparison'

function usePhotoSrc(photo: ComparisonPhoto | null) {
  const [preview, setPreview] = useState<{ photo: File; url: string } | null>(null)
  useEffect(() => {
    if (!photo || typeof photo === 'string') return
    const url = URL.createObjectURL(photo)
    // Object URL은 외부 리소스이므로 effect에서 만들고 같은 수명 안에서 해제한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview({ photo, url })
    return () => URL.revokeObjectURL(url)
  }, [photo])
  return typeof photo === 'string' ? photo : preview?.photo === photo ? preview?.url : undefined
}

/** 작성·수정에서 원본은 공개 선택이 켜져 있을 때만 업로드 목록에 포함한다. */
export function usePostAiComparison(
  photos: ComparisonPhoto[],
  initial: CommunityAiComparison | null | undefined,
  jobId?: string,
) {
  const [initialChoice] = useState<PostAiComparisonChoice>(() => ({
    enabled: Boolean(initial),
    before: initial ? (photos[initial.beforePhotoIndex] ?? null) : null,
    after: initial ? (photos[initial.afterPhotoIndex] ?? null) : (photos[0] ?? null),
    sources: initial && photos[initial.beforePhotoIndex] ? [photos[initial.beforePhotoIndex]] : [],
    privateBefore: false,
  }))
  const [choice, setChoice] = useState(initialChoice)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])
  const submission = prepareComparisonPost(photos, choice)

  const load = async (read: (signal: AbortSignal) => Promise<File>) => {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    setBusy(true)
    setError(null)
    try {
      const before = await read(controller.signal)
      if (!controller.signal.aborted)
        setChoice((current) => ({
          ...current,
          before,
          privateBefore: true,
          sources: [...current.sources, before],
        }))
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : '원본을 가져오지 못했어요. 다시 선택해 주세요.',
        )
    } finally {
      if (active.current === controller) {
        active.current = null
        setBusy(false)
      }
    }
  }
  const chooseArchive = (selectedJobId: string) =>
    load(async (signal) => {
      const blob = await getAiImageGenerationSourceImage(selectedJobId, signal)
      const extension =
        blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png'
      return new File([blob], `pawpong-original-${selectedJobId}.${extension}`, {
        type: blob.type || 'image/png',
      })
    })
  const toggle = (enabled: boolean) => {
    setChoice((current) => ({
      ...current,
      enabled,
      after: submission.after ?? photos.find((p) => !current.sources.includes(p)) ?? null,
    }))
    setError(null)
    if (!enabled) {
      active.current?.abort()
      active.current = null
      setBusy(false)
    } else if (!submission.before && jobId) {
      void chooseArchive(jobId)
    }
  }
  return {
    choice,
    submission,
    busy,
    error,
    beforeSrc: usePhotoSrc(submission.before),
    afterSrc: usePhotoSrc(submission.after),
    hasChanges: choice !== initialChoice,
    hasPending: () => active.current !== null,
    toggle,
    chooseAfter: (after: ComparisonPhoto) => setChoice((current) => ({ ...current, after })),
    chooseArchive,
    chooseFile: (file: File) => load(() => preparePhoto(file)),
  }
}
export type PostAiComparisonEditorState = ReturnType<typeof usePostAiComparison>
