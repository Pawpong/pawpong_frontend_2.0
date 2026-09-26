'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PawPrintIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { Button, PixelTab } from '@/shared/ui'
import { useAiPixelFilter } from '../lib/useAiPixelFilter'

interface PhotoSlot {
  file: File
  url: string
}

interface AiPixelPhotoPanelProps {
  /** 글에 새로 고른 사진들 (아직 업로드 전) */
  photos: PhotoSlot[]
  /** 사진 한 장을 다른 파일로 바꾸고 새 미리보기 URL 을 돌려준다 (지워졌으면 null) */
  onReplace: (url: string, file: File) => string | null
  disabled?: boolean
}

/** 원본 ↔ 도트 전환을 위해 두 파일을 함께 들고 있는 자리 */
interface Conversion {
  slotUrl: string
  original: File
  dot: File
  dotPreviewUrl: string
  /** 비교용 원본 미리보기 (이 패널이 만든 object URL — 교체·언마운트 시 해제) */
  originalPreviewUrl: string
  showing: 'dot' | 'original'
}

const PROGRESS_BLOCKS = 12
/** 보통 30~60초. 이 시간 동안 막대를 90%까지만 채우고 결과가 오면 끝낸다 */
const EXPECTED_SECONDS = 50

const useElapsedSeconds = (running: boolean) => {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!running) return
    const startedAt = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => {
      clearInterval(timer)
      setElapsed(0)
    }
  }, [running])
  return elapsed
}

/**
 * 커뮤니티 글쓰기의 AI 도트 필터 카드.
 *
 * 올린 사진 한 장을 골라 포퐁 도트 그림으로 바꾸면 그 사진 자리에 도트 버전이 들어간다.
 * 결과는 일반 사진 파일이라 게시글·수정·명예의 전당이 모두 기존 사진 흐름을 그대로 탄다.
 * PixelTab 으로 언제든 원본으로 되돌릴 수 있다. 활성 필터가 없으면 그리지 않는다.
 */
export function AiPixelPhotoPanel({ photos, onReplace, disabled }: AiPixelPhotoPanelProps) {
  const ai = useAiPixelFilter()
  const elapsed = useElapsedSeconds(ai.isWorking)
  const [pickedUrl, setPickedUrl] = useState<string | null>(null)
  const [conversion, setConversion] = useState<Conversion | null>(null)

  // 사용자가 사진 목록에서 지운 자리는 더 이상 따라가지 않는다
  const activeConversion =
    conversion && photos.some((photo) => photo.url === conversion.slotUrl) ? conversion : null
  const selectedUrl =
    pickedUrl && photos.some((photo) => photo.url === pickedUrl)
      ? pickedUrl
      : (photos[0]?.url ?? null)
  const selectedSlot = photos.find((photo) => photo.url === selectedUrl) ?? null
  const isSelectedConverted = !!activeConversion && activeConversion.slotUrl === selectedUrl

  // 비교용 원본 미리보기 URL 은 이 패널이 만들었으니 언마운트 때 정리한다
  const previewUrlRef = useRef<string | null>(null)
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  if (!ai.isAvailable) return null

  const busy = disabled || ai.isWorking
  const filledBlocks =
    ai.phase === 'uploading'
      ? 1
      : Math.max(2, Math.round(Math.min(0.9, elapsed / EXPECTED_SECONDS) * PROGRESS_BLOCKS))

  const convert = async () => {
    if (!selectedSlot || busy) return
    // 이미 도트로 바꾼 자리를 다시 만들 때는 원본에서 다시 그린다
    const source = isSelectedConverted ? activeConversion.original : selectedSlot.file
    const result = await ai.start(source)
    if (!result) return
    const slotUrl = onReplace(selectedSlot.url, result.file)
    if (!slotUrl) return
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const originalPreviewUrl = URL.createObjectURL(source)
    previewUrlRef.current = originalPreviewUrl
    setPickedUrl(slotUrl)
    setConversion({
      slotUrl,
      original: source,
      dot: result.file,
      dotPreviewUrl: result.imageUrl,
      originalPreviewUrl,
      showing: 'dot',
    })
  }

  const show = (mode: 'dot' | 'original') => {
    if (!activeConversion || activeConversion.showing === mode || disabled) return
    const slotUrl = onReplace(
      activeConversion.slotUrl,
      mode === 'dot' ? activeConversion.dot : activeConversion.original,
    )
    if (!slotUrl) return
    setPickedUrl(slotUrl)
    setConversion({ ...activeConversion, slotUrl, showing: mode })
  }

  return (
    <section
      aria-labelledby="ai-pixel-heading"
      className="rounded-xl border border-primary-200 bg-point-50 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="ai-pixel-heading"
          className={cn(
            cafe24Proup.className,
            'flex items-center gap-1.5 font-cafe24 text-base font-bold text-primary-500',
          )}
        >
          <PawPrintIcon aria-hidden="true" className="size-4 rotate-30 text-secondary-500" />
          AI 도트 필터
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-neutral-700">
          선택
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-neutral-700">
        올린 사진을 포퐁 감성 도트 그림으로 바꿔 올릴 수 있어요. 좋아요를 많이 받으면 명예의 전당에
        올라요!
      </p>

      {photos.length === 0 ? (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-neutral-700">
          위에서 사진을 먼저 추가해 주세요.
        </p>
      ) : (
        <>
          {photos.length > 1 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-neutral-850">바꿀 사진</p>
              <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="바꿀 사진 선택">
                {photos.map((photo, index) => {
                  const selected = photo.url === selectedUrl
                  const converted =
                    activeConversion?.slotUrl === photo.url && activeConversion.showing === 'dot'
                  return (
                    <li key={photo.url} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${index + 1}번째 사진${converted ? ' (도트 그림)' : ''}`}
                        disabled={busy}
                        onClick={() => setPickedUrl(photo.url)}
                        className={cn(
                          'relative block size-14 overflow-hidden rounded-md border-2 bg-white focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed',
                          selected ? 'border-primary-500' : 'border-transparent',
                        )}
                      >
                        <Image
                          src={photo.url}
                          alt=""
                          fill
                          unoptimized
                          sizes="56px"
                          className="object-cover"
                        />
                        {converted && (
                          <PawPrintIcon
                            aria-hidden="true"
                            className="absolute right-0.5 bottom-0.5 size-4 rotate-30 text-secondary-500"
                          />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {ai.filters.length > 1 ? (
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="필터 선택">
              {ai.filters.map((filter) => {
                const selected = filter.filterId === ai.selectedFilterId
                return (
                  <li key={filter.filterId} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={busy}
                      onClick={() => ai.selectFilter(filter.filterId)}
                      className={cn(
                        'flex w-24 flex-col items-center gap-1.5 rounded-lg border-2 bg-white p-1.5 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed',
                        selected
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-primary-200',
                      )}
                    >
                      <FilterThumbnail src={filter.thumbnailUrl} />
                      <span className="line-clamp-1 text-xs font-semibold text-neutral-850">
                        {filter.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-2">
              <FilterThumbnail src={ai.filters[0].thumbnailUrl} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-850">{ai.filters[0].name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-neutral-700">
                  {ai.filters[0].description}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4">
            {ai.isWorking ? (
              <div role="status" aria-live="polite">
                <div
                  className="flex gap-1"
                  role="progressbar"
                  aria-label="도트 변환 진행"
                  aria-valuemin={0}
                  aria-valuemax={PROGRESS_BLOCKS}
                  aria-valuenow={filledBlocks}
                >
                  {Array.from({ length: PROGRESS_BLOCKS }, (_, index) => (
                    <span
                      key={index}
                      className={cn(
                        'h-3 flex-1 transition-colors duration-500',
                        index < filledBlocks
                          ? 'bg-primary-500'
                          : index === filledBlocks
                            ? 'animate-pulse bg-primary-200'
                            : 'bg-white',
                      )}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-850">
                  {ai.phase === 'uploading'
                    ? '사진을 올리고 있어요…'
                    : `도트를 한 칸씩 찍고 있어요… ${elapsed}초`}
                </p>
                <p className="mt-0.5 text-xs text-neutral-700">
                  보통 30초~1분 걸려요. 그동안 글을 계속 써도 괜찮아요.
                </p>
              </div>
            ) : isSelectedConverted ? (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <ComparePreview label="원본" src={activeConversion.originalPreviewUrl} />
                  <ComparePreview label="도트 그림" src={activeConversion.dotPreviewUrl} pixel />
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-850">글에 올릴 사진</p>
                <div className="mt-2 flex gap-2" role="radiogroup" aria-label="글에 올릴 사진">
                  {(
                    [
                      { mode: 'dot', label: '도트 그림' },
                      { mode: 'original', label: '원본 사진' },
                    ] as const
                  ).map((option) => {
                    const selected = activeConversion.showing === option.mode
                    return (
                      <button
                        key={option.mode}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => show(option.mode)}
                        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                      >
                        <PixelTab
                          label={option.label}
                          status={selected ? 'active' : 'default'}
                          compactTablet
                        />
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="text"
                  disabled={busy}
                  onClick={() => void convert()}
                  className="mt-2 min-h-11 px-2 text-primary-700 underline underline-offset-4"
                >
                  한 번 더 만들기
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                disabled={!selectedSlot || busy}
                onClick={() => void convert()}
                className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {ai.phase === 'failed'
                  ? '다시 시도하기'
                  : photos.length > 1
                    ? '고른 사진을 도트 그림으로 바꾸기'
                    : '도트 그림으로 바꾸기'}
              </Button>
            )}
          </div>

          {ai.error && (
            <p role="alert" className="mt-3 rounded-lg bg-white p-3 text-sm text-error-500">
              {ai.error}
            </p>
          )}
        </>
      )}

      <p className="mt-4 border-t border-primary-200 pt-3 text-xs leading-relaxed text-neutral-700">
        하루 3번까지 만들 수 있어요. 실패한 변환은 횟수에 포함되지 않아요.
      </p>
    </section>
  )
}

function FilterThumbnail({ src }: { src?: string }) {
  return (
    <span className="relative block size-14 shrink-0 overflow-hidden rounded-md bg-point-100">
      {src && (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="56px"
          className="object-cover [image-rendering:pixelated]"
        />
      )}
    </span>
  )
}

function ComparePreview({ label, src, pixel }: { label: string; src: string; pixel?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-lg bg-white">
      <span className="relative block aspect-square w-full bg-neutral-50">
        <Image
          src={src}
          alt={label}
          fill
          unoptimized
          sizes="(min-width: 768px) 160px, 40vw"
          className={cn('object-contain', pixel && '[image-rendering:pixelated]')}
        />
      </span>
      <figcaption className="px-2 py-1.5 text-xs font-semibold text-neutral-700">
        {label}
      </figcaption>
    </figure>
  )
}
