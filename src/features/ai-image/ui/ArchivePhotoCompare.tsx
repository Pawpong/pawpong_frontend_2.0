'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getAiImageGenerationSourceImage } from '@/entities/ai-image'
import { RetryButton, Button } from '@/shared/ui'

/** 보관한 사진의 원본은 필요할 때만 인증해서 불러오고 닫힐 때 메모리에서 해제한다. */
export function ArchivePhotoCompare({
  jobId,
  resultImageUrl,
  filterName,
}: {
  jobId: string
  resultImageUrl: string
  filterName: string
}) {
  const [view, setView] = useState<'before' | 'after'>('after')
  const [source, setSource] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (view !== 'before') return
    const controller = new AbortController()
    let objectUrl: string | undefined
    void getAiImageGenerationSourceImage(jobId, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setSource(objectUrl)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [jobId, view, attempt])

  const selectView = (next: 'before' | 'after') => {
    if (next === view) return
    setSource(null)
    setError(false)
    setView(next)
  }
  const image = view === 'after' ? resultImageUrl : source
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="원본과 AI 사진 비교" className="grid grid-cols-2 gap-2">
        <Button
          size="md"
          intent={view === 'before' ? 'primary' : 'secondary'}
          aria-pressed={view === 'before'}
          onClick={() => selectView('before')}
        >
          비포 · 원본
        </Button>
        <Button
          size="md"
          intent={view === 'after' ? 'primary' : 'secondary'}
          aria-pressed={view === 'after'}
          onClick={() => selectView('after')}
        >
          애프터 · AI 사진
        </Button>
      </div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50"
        aria-busy={view === 'before' && !source && !error}
      >
        {image ? (
          <Image
            src={image}
            alt={view === 'before' ? 'AI 변환 전 원본 사진' : `${filterName} 결과`}
            fill
            unoptimized
            sizes="(min-width: 768px) 448px, 100vw"
            className="object-contain"
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-neutral-700"
            role={error ? 'alert' : 'status'}
          >
            <p>{error ? '원본 사진을 불러오지 못했어요.' : '원본 사진을 불러오는 중…'}</p>
            {error && (
              <RetryButton
                onRetry={() => {
                  setError(false)
                  setAttempt((a) => a + 1)
                }}
              />
            )}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-neutral-600">
        저장하거나 커뮤니티에 올릴 때는 AI 사진이 사용돼요.
      </p>
    </div>
  )
}
