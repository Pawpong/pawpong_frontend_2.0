'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PawPrintIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { Button, PixelTab } from '@/shared/ui'
import type { useAiPixelFilter } from '../lib/useAiPixelFilter'

interface AiPixelFilterPanelProps {
  state: ReturnType<typeof useAiPixelFilter>
  /** 변환할 사진 (없으면 안내만 보여준다) */
  photo?: { file: File; url: string }
  disabled?: boolean
}

/** 진행 막대 칸 수 — 도트 한 칸씩 채워지는 느낌을 준다 */
const PROGRESS_BLOCKS = 12
/** 보통 30~60초. 이 시간 동안 막대를 90%까지만 채우고 결과가 오면 끝낸다 */
const EXPECTED_SECONDS = 50

/** 변환이 진행되는 동안 경과 초를 센다 */
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
 * 콘테스트 사진을 AI 도트 그림으로 바꾸는 카드.
 * 필터 고르기 → 변환 → 도트/원본 중 참여할 사진 고르기. 결과는 위 사진 칸에 바로 반영된다.
 * 관리자가 등록한 활성 필터가 없으면 아무것도 그리지 않는다.
 */
export function AiPixelFilterPanel({ state, photo, disabled }: AiPixelFilterPanelProps) {
  const elapsed = useElapsedSeconds(state.isWorking)
  if (!state.isAvailable) return null

  const busy = disabled || state.isWorking
  const canStart = !!photo && !!state.selectedFilterId && !busy
  const filledBlocks =
    state.phase === 'uploading'
      ? 1
      : Math.max(2, Math.round(Math.min(0.9, elapsed / EXPECTED_SECONDS) * PROGRESS_BLOCKS))

  return (
    <section
      aria-labelledby="ai-pixel-heading"
      className="mt-6 rounded-xl border border-primary-200 bg-point-50 p-4 tab:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="ai-pixel-heading"
          className={cn(
            cafe24Proup.className,
            'flex items-center gap-1.5 font-cafe24 text-lg font-bold text-primary-500',
          )}
        >
          <PawPrintIcon aria-hidden="true" className="size-4 rotate-30 text-secondary-500" />
          AI 도트 필터
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-neutral-700">
          선택
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700">
        우리 아이를 포퐁 감성 도트 그림으로 바꿔 참여할 수 있어요.
      </p>

      {state.filters.length > 1 && (
        <ul className="mt-4 flex gap-2.5 overflow-x-auto pb-1" aria-label="필터 선택">
          {state.filters.map((filter) => {
            const selected = filter.filterId === state.selectedFilterId
            return (
              <li key={filter.filterId} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => state.selectFilter(filter.filterId)}
                  className={cn(
                    'relative flex w-24 flex-col items-center gap-1.5 rounded-lg border-2 bg-white p-1.5 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed',
                    selected ? 'border-primary-500' : 'border-transparent hover:border-primary-200',
                  )}
                >
                  <FilterThumbnail src={filter.thumbnailUrl} />
                  <span className="line-clamp-1 text-xs font-semibold text-neutral-850">
                    {filter.name}
                  </span>
                  {selected && (
                    <PawPrintIcon
                      aria-hidden="true"
                      className="absolute -top-1.5 -right-1.5 size-5 rotate-30 text-secondary-500"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {state.filters.length === 1 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-2">
          <FilterThumbnail src={state.filters[0].thumbnailUrl} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-850">{state.filters[0].name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-neutral-700">
              {state.filters[0].description}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        {state.isWorking ? (
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
              {state.phase === 'uploading'
                ? '사진을 올리고 있어요…'
                : `도트를 한 칸씩 찍고 있어요… ${elapsed}초`}
            </p>
            <p className="mt-0.5 text-xs text-neutral-700">
              보통 30초~1분 걸려요. 이 화면을 닫지 말아 주세요.
            </p>
          </div>
        ) : state.aiResult && photo ? (
          <div>
            <p className="text-sm font-semibold text-neutral-850">참여할 사진을 골라 주세요</p>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label="참여할 사진">
              {(
                [
                  { useAi: true, label: '도트 그림' },
                  { useAi: false, label: '원본 사진' },
                ] as const
              ).map((option) => {
                const selected = state.useAiVersion === option.useAi
                return (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => state.setUseAiVersion(option.useAi)}
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
              disabled={!canStart}
              onClick={() => photo && void state.start(photo.file)}
              className="mt-3 min-h-11 px-2 text-primary-700 underline underline-offset-4"
            >
              {state.filters.length > 1 ? '다른 필터로 다시 만들기' : '한 번 더 만들기'}
            </Button>
          </div>
        ) : (
          <>
            <Button
              size="lg"
              disabled={!canStart}
              onClick={() => photo && void state.start(photo.file)}
              className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {state.phase === 'failed' ? '다시 시도하기' : '도트 그림으로 바꾸기'}
            </Button>
            {!photo && (
              <p className="mt-2 text-xs text-neutral-700">대표 사진을 먼저 선택해 주세요.</p>
            )}
          </>
        )}
      </div>

      {state.error && (
        <p role="alert" className="mt-3 rounded-lg bg-white p-3 text-sm text-error-500">
          {state.error}
        </p>
      )}

      <p className="mt-4 border-t border-primary-200 pt-3 text-xs leading-relaxed text-neutral-700">
        콘테스트마다 3번까지 만들 수 있어요. 실패한 변환은 횟수에 포함되지 않아요.
      </p>
    </section>
  )
}

function FilterThumbnail({ src }: { src?: string }) {
  return (
    <span className="relative block size-16 shrink-0 overflow-hidden rounded-md bg-point-100">
      {src && (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover [image-rendering:pixelated]"
        />
      )}
    </span>
  )
}
