'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { PawPrintIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { preparePhoto } from '@/shared/lib/preparePhoto'
import { Button, ComposerSectionHeading } from '@/shared/ui'
import { PhotoUploadField } from '@/shared/ui/PhotoUploadField'
import type { AiImageGeneration } from '@/shared/types'
import { saveAiImageFile } from '../lib/aiImageFile'
import { setPendingCommunityPhoto } from '../lib/pendingCommunityPhoto'
import { useAiPixelFilter } from '../lib/useAiPixelFilter'
import { AiPhotoArchive } from './AiPhotoArchive'
import { BeforeAfterCompare } from './BeforeAfterCompare'

/** 서버 일일 쿼터와 같은 값 (콘테스트 없이 쓰는 생성은 하루 3회) */
const DAILY_LIMIT = 3
const PROGRESS_BLOCKS = 12
/** 보통 30~60초. 이 시간 동안 막대를 90%까지만 채우고 결과가 오면 끝낸다 */
const EXPECTED_SECONDS = 50
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** 기다리는 동안 번갈아 보여줄 문구 */
const WAITING_TIPS = [
  '우리 아이 얼굴을 살피고 있어요',
  '어울리는 색을 고르고 있어요',
  '한 칸 한 칸 그려 넣고 있어요',
  '마지막으로 다듬고 있어요',
]

const kstDay = (instant: number) => Math.floor((instant + KST_OFFSET_MS) / 86_400_000)

/** 오늘(KST) 만든 것 중 실패하지 않은 건수 — 서버 쿼터 계산과 같은 기준 */
const countToday = (jobs: AiImageGeneration[]) => {
  const today = kstDay(Date.now())
  return jobs.filter(
    (job) => job.status !== 'failed' && kstDay(Date.parse(job.createdAt)) === today,
  ).length
}

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

interface AiFilterStudioProps {
  isLoggedIn: boolean
}

/**
 * AI 필터 탭.
 * 사진 한 장 → 어드민이 등록한 필터 중 하나 고르기 → 변환 → 원본과 비교 → 저장·커뮤니티에 올리기.
 * 만든 사진은 보관함에 쌓이고, 마이홈 'AI 사진' 탭에서도 볼 수 있다.
 */
export function AiFilterStudio({ isLoggedIn }: AiFilterStudioProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const ai = useAiPixelFilter()
  const generationsQuery = useQuery(aiImageQueries.myGenerations(isLoggedIn))
  const elapsed = useElapsedSeconds(ai.isWorking)
  const [photo, setPhoto] = useState<{ file: File; url: string }>()
  const [preparing, setPreparing] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url)
    },
    [photo],
  )

  const usedToday = countToday(generationsQuery.data ?? [])
  const remaining = Math.max(0, DAILY_LIMIT - usedToday)
  const selectedFilter = ai.filters.find((filter) => filter.filterId === ai.selectedFilterId)
  const result = ai.result

  const selectPhoto = async (files: FileList) => {
    if (!files.length || preparing || ai.isWorking) return
    setPreparing(true)
    setPhotoError(null)
    try {
      const file = await preparePhoto(files[0])
      ai.reset()
      setPhoto({ file, url: URL.createObjectURL(file) })
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : '사진을 준비하지 못했어요.')
    } finally {
      setPreparing(false)
    }
  }

  const convert = async () => {
    if (!photo || ai.isWorking) return
    const done = await ai.start(photo.file)
    void queryClient.invalidateQueries({ queryKey: aiImageQueries.myGenerations().queryKey })
    if (done) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const save = async () => {
    if (!result) return
    setSaving(true)
    try {
      await saveAiImageFile(result.file)
    } finally {
      setSaving(false)
    }
  }

  const postToCommunity = () => {
    if (!result) return
    setPendingCommunityPhoto(result.file)
    router.push('/community/write')
  }

  const filledBlocks =
    ai.phase === 'uploading'
      ? 1
      : Math.max(2, Math.round(Math.min(0.9, elapsed / EXPECTED_SECONDS) * PROGRESS_BLOCKS))

  return (
    <div className="mx-auto w-full max-w-[68rem] px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      {/* 소개 */}
      <section className="rounded-2xl bg-point-50 p-5 tab:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
              <PawPrintIcon aria-hidden className="size-4 rotate-30 text-secondary-500" />
              포퐁 AI 필터
            </p>
            <h1
              className={cn(
                cafe24Proup.className,
                'mt-2 font-cafe24 text-2xl leading-snug font-bold text-neutral-850 tab:text-3xl',
              )}
            >
              우리 아이, 오늘은 어떤 모습?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              사진 한 장이면 도트 그림부터 스티커·수채화까지. 마음에 들면 저장하거나 커뮤니티에
              자랑해 보세요.
            </p>
          </div>
          {isLoggedIn && (
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-850">
              오늘 남은 횟수 <strong className="text-primary-700">{remaining}</strong>/{DAILY_LIMIT}
            </span>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 tab:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] tab:gap-10">
        {/* 1. 사진 */}
        <section aria-labelledby="ai-photo-heading" className="min-w-0">
          <ComposerSectionHeading id="ai-photo-heading" step={1} required>
            우리 아이 사진
          </ComposerSectionHeading>
          {isLoggedIn ? (
            <>
              <PhotoUploadField
                preview={photo?.url}
                processing={preparing}
                disabled={ai.isWorking}
                onSelect={(files) => void selectPhoto(files)}
                onRemove={() => {
                  ai.reset()
                  setPhoto(undefined)
                }}
              />
              {photoError && (
                <p role="alert" className="mt-3 text-sm text-error-500">
                  {photoError}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-700">
                얼굴이 잘 보이는 정면 사진일수록 우리 아이와 닮게 나와요.
              </p>
            </>
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-xl border border-primary-200 bg-point-50 p-6 text-center">
              <p className="text-sm font-semibold text-neutral-850">
                로그인하면 우리 아이 사진으로 바로 만들어 볼 수 있어요
              </p>
              <Link
                href={`/login?returnUrl=${encodeURIComponent('/ai-filter')}`}
                className="rounded-full bg-point-500 px-6 py-3 text-sm font-semibold text-neutral-850 hover:bg-point-300"
              >
                로그인하고 시작하기
              </Link>
            </div>
          )}
        </section>

        {/* 2. 필터 */}
        <section aria-labelledby="ai-filter-heading" className="min-w-0">
          <ComposerSectionHeading id="ai-filter-heading" step={2} required>
            필터 고르기
          </ComposerSectionHeading>
          {ai.filters.length === 0 ? (
            <p className="rounded-xl bg-neutral-50 p-5 text-sm text-neutral-700">
              지금은 쓸 수 있는 필터가 없어요. 곧 새 필터로 찾아올게요!
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 pc:grid-cols-3" aria-label="필터 목록">
              {ai.filters.map((filter) => {
                const selected = filter.filterId === ai.selectedFilterId
                return (
                  <li key={filter.filterId}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={ai.isWorking}
                      onClick={() => ai.selectFilter(filter.filterId)}
                      className={cn(
                        'relative flex w-full flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed',
                        selected
                          ? 'border-primary-500'
                          : 'border-neutral-150 hover:border-primary-200',
                      )}
                    >
                      <span className="relative block aspect-square w-full bg-point-100">
                        {filter.thumbnailUrl && (
                          <Image
                            src={filter.thumbnailUrl}
                            alt=""
                            fill
                            unoptimized
                            sizes="(min-width: 1024px) 200px, 45vw"
                            className="object-cover"
                          />
                        )}
                        {selected && (
                          <span className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-point-500 shadow">
                            <PawPrintIcon
                              aria-hidden
                              className="size-5 rotate-30 text-secondary-500"
                            />
                          </span>
                        )}
                      </span>
                      <span className="block p-3">
                        <span className="block text-sm font-bold text-neutral-850">
                          {filter.name}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-neutral-700">
                          {filter.description}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* 3. 만들기 · 결과 */}
      {isLoggedIn && ai.filters.length > 0 && (
        <section ref={resultRef} aria-live="polite" className="mx-auto mt-10 max-w-xl">
          {ai.isWorking ? (
            <div role="status" className="rounded-2xl border border-primary-200 bg-point-50 p-5">
              <div
                className="flex gap-1"
                role="progressbar"
                aria-label="AI 필터 진행"
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
              <p className="mt-3 text-sm font-semibold text-neutral-850">
                {ai.phase === 'uploading'
                  ? '사진을 올리고 있어요…'
                  : `${WAITING_TIPS[Math.min(WAITING_TIPS.length - 1, Math.floor(elapsed / 12))]}… ${elapsed}초`}
              </p>
              <p className="mt-0.5 text-xs text-neutral-700">보통 30초~1분 걸려요.</p>
            </div>
          ) : result && photo ? (
            <div>
              <h2
                className={cn(
                  cafe24Proup.className,
                  'mb-3 text-center font-cafe24 text-xl font-bold text-primary-500',
                )}
              >
                짜잔! {selectedFilter?.name ?? 'AI 필터'} 완성
              </h2>
              <BeforeAfterCompare beforeSrc={photo.url} afterSrc={result.imageUrl} />
              <p className="mt-2 text-center text-xs text-neutral-700">
                가운데 손잡이를 끌어 원본과 비교해 보세요. 보관함에도 저장됐어요.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="lg" disabled={saving} onClick={() => void save()}>
                  {saving ? '준비 중…' : '저장하기'}
                </Button>
                <Button size="lg" onClick={postToCommunity}>
                  커뮤니티에 자랑하기
                </Button>
              </div>
              <Button
                variant="text"
                disabled={remaining === 0}
                onClick={() => {
                  ai.reset()
                  document
                    .getElementById('ai-filter-heading')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="mx-auto mt-3 min-h-11 px-3 text-primary-700 underline underline-offset-4"
              >
                다른 필터로 또 만들기
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                disabled={!photo || !selectedFilter || remaining === 0 || preparing}
                onClick={() => void convert()}
                className="w-full"
              >
                {remaining === 0
                  ? '오늘은 다 만들었어요 · 내일 다시 만나요'
                  : selectedFilter
                    ? `${selectedFilter.name} 씌우기`
                    : '필터를 골라 주세요'}
              </Button>
              {!photo && (
                <p className="mt-2 text-center text-xs text-neutral-700">
                  먼저 우리 아이 사진을 올려 주세요.
                </p>
              )}
              {ai.error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-error-500"
                >
                  {ai.error}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* 보관함 미리보기 */}
      {isLoggedIn && (
        <section aria-labelledby="ai-archive-heading" className="mt-14">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="ai-archive-heading" className="text-lg font-bold text-neutral-850">
              내 AI 사진
            </h2>
            <Link href="/home?tab=ai-photos" className="text-sm font-semibold text-primary-700">
              보관함 →
            </Link>
          </div>
          <AiPhotoArchive enabled={isLoggedIn} limit={8} moreHref="/home?tab=ai-photos" />
        </section>
      )}
    </div>
  )
}
