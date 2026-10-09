'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { PawPrintIcon, PixelArrowRightIcon } from '@/shared/assets'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { isAuthReadSessionCurrent } from '@/shared/lib/authReadSession'
import { useViewportPosition } from '@/shared/lib/useViewportPosition'
import { AsyncState, Button, ComposerSectionHeading, buttonVariants } from '@/shared/ui'
import { PhotoUploadField } from '@/shared/ui/PhotoUploadField'
import { SkeletonBlock } from '@/shared/ui/Skeleton'
import {
  AI_IMAGE_SAVE_UNSUPPORTED,
  AI_IMAGE_SAVE_UNSUPPORTED_MESSAGE,
  saveAiImageFile,
} from '../lib/aiImageFile'
import { useAiSourcePhoto } from '../lib/useAiSourcePhoto'
import { setPendingCommunityPhoto } from '../lib/pendingCommunityPhoto'
import { AiPostShareChoice } from './AiPostShareChoice'
import { useAiPixelFilter } from '../lib/useAiPixelFilter'
import { AiPhotoArchive } from './AiPhotoArchive'
import { BeforeAfterCompare } from './BeforeAfterCompare'

const PROGRESS_BLOCKS = 12
/** 보통 30~60초. 이 시간 동안 막대를 90%까지만 채우고 결과가 오면 끝낸다 */
const EXPECTED_SECONDS = 50

/** 기다리는 동안 번갈아 보여줄 문구 */
const WAITING_TIPS = [
  '우리 아이 얼굴을 살피고 있어요',
  '어울리는 색을 고르고 있어요',
  '한 칸 한 칸 그려 넣고 있어요',
  '마지막으로 다듬고 있어요',
]

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
  gameCharacter?: boolean
  sourceJobId?: string
  sessionGeneration: number
  isLoggedIn: boolean
  allowance?: { remaining: number; freeRemaining: number; dailyFreeLimit: number; enabled: boolean }
  quotaError?: boolean
  onRefreshQuota?: () => void
  onGenerationSettled?: () => void
  /** 결과 사진 아래 붙일 이어가기 버튼(예: 반려동물 캐릭터 만들기). 다른 기능은 화면 조립 계층에서 넣는다. */
  renderResultAction?: (jobId: string, className?: string) => ReactNode
}

/**
 * AI 필터 탭.
 * 사진 한 장 → 어드민이 등록한 필터 중 하나 고르기 → 변환 → 원본과 비교 → 저장·커뮤니티에 올리기.
 * 만든 사진은 보관함에 쌓이고, 마이홈 'AI 사진' 탭에서도 볼 수 있다.
 */
export function AiFilterStudio({
  gameCharacter = false,
  sourceJobId,
  sessionGeneration,
  isLoggedIn,
  allowance,
  quotaError,
  onRefreshQuota,
  onGenerationSettled,
  renderResultAction,
}: AiFilterStudioProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const ai = useAiPixelFilter(gameCharacter)
  const elapsed = useElapsedSeconds(ai.isWorking)
  const {
    photo,
    preparing,
    error: photoError,
    selectPhoto: prepareSelectedPhoto,
    clearPhoto,
  } = useAiSourcePhoto({
    sourceJobId: gameCharacter ? sourceJobId : undefined,
    enabled: isLoggedIn,
    generation: sessionGeneration,
  })
  const [saving, setSaving] = useState(false)
  const [shareComparison, setShareComparison] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const remaining = allowance?.remaining
  const canGenerate = Boolean(allowance?.enabled && remaining && remaining > 0)
  const selectedFilter = ai.filters.find((filter) => filter.filterId === ai.selectedFilterId)
  const result = ai.result
  const awaitingResult = ai.phase === 'pending'
  const canConvert = Boolean(photo && selectedFilter && canGenerate && !preparing)
  const generateLabel = !allowance
    ? '이용 가능 횟수를 확인해 주세요'
    : !allowance.enabled
      ? '지금은 AI 사진 만들기가 쉬고 있어요'
      : remaining === 0
        ? PLAYGROUND_BILLING_ENABLED
          ? '이용권이 부족해요 · 놀이터에서 확인해 주세요'
          : '오늘 만들 수 있는 횟수를 모두 사용했어요'
        : selectedFilter
          ? gameCharacter
            ? '캐릭터 만들기 · 1회 사용'
            : `${selectedFilter.name} 씌우기`
          : '필터를 골라 주세요'
  const [ctaRef, ctaPosition] = useViewportPosition<HTMLDivElement>()
  // 사진과 필터를 고른 뒤 만들기 버튼이 아직 화면 아래에 있으면 모바일 하단에 같은 버튼을 띄운다.
  // 버튼을 지나 보관함까지 내려간 경우(위로 지나감)에는 띄우지 않아 아래 내용을 가리지 않는다.
  const showFloatingCta =
    isLoggedIn &&
    canConvert &&
    ctaPosition === 'below' &&
    !ai.isWorking &&
    !awaitingResult &&
    !result
  const returnUrl = gameCharacter
    ? `/ai-filter?purpose=pet-sprite-v1${sourceJobId ? `&sourceJobId=${encodeURIComponent(sourceJobId)}` : ''}`
    : '/ai-filter'

  const selectPhoto = async (files: FileList) => {
    if (!files.length || preparing || ai.isWorking) return
    if (await prepareSelectedPhoto(files[0])) {
      ai.reset()
      setShareComparison(false)
      setShareError(null)
    }
  }

  const convert = async () => {
    if (!photo || ai.isWorking || !canGenerate) return
    const done = await ai.start(photo.file)
    void queryClient.invalidateQueries({ queryKey: aiImageQueries.myGenerations().queryKey })
    onGenerationSettled?.()
    if (done) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const checkResult = async () => {
    const done = await ai.resume()
    void queryClient.invalidateQueries({ queryKey: aiImageQueries.myGenerations().queryKey })
    onGenerationSettled?.()
    if (done) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const save = async () => {
    if (!result || saving) return
    if (!isAuthReadSessionCurrent(result.session)) {
      setShareError('로그인 정보를 확인한 뒤 보관함에서 사진을 다시 선택해 주세요.')
      return
    }
    setShareError(null)
    setSaving(true)
    try {
      await saveAiImageFile(result.file)
    } catch (error) {
      setShareError(
        error instanceof Error && error.name === AI_IMAGE_SAVE_UNSUPPORTED
          ? AI_IMAGE_SAVE_UNSUPPORTED_MESSAGE
          : '사진을 저장하지 못했어요. 다시 시도해 주세요.',
      )
    } finally {
      setSaving(false)
    }
  }

  const postToCommunity = () => {
    if (!result) return
    setShareError(null)
    try {
      setPendingCommunityPhoto(
        result.file,
        shareComparison ? photo?.file : undefined,
        result.jobId,
        result.session,
      )
      router.push('/community/write?source=ai-photo')
    } catch {
      setShareError('로그인 정보를 확인한 뒤 보관함에서 사진을 다시 선택해 주세요.')
    }
  }

  const filledBlocks =
    ai.phase === 'uploading' || ai.phase === 'checking'
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
              {gameCharacter ? '캐릭터 만들기' : '포퐁 AI 필터'}
            </p>
            <h1
              className={cn(
                cafe24Proup.className,
                'mt-2 font-cafe24 text-2xl leading-snug font-bold text-neutral-850 tab:text-3xl',
              )}
            >
              {gameCharacter ? '우리 아이를 게임 속 친구로' : '우리 아이, 오늘은 어떤 모습?'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {gameCharacter
                ? '우리 아이 사진이나 이미 만든 AI 사진으로 캐릭터를 만들어요. 털색·무늬·귀 모양을 살려 몸과 발·꼬리까지 그려요. 완성된 캐릭터를 직접 연결하면 이름과 성장 기록은 그대로예요.'
                : '사진 한 장이면 도트 그림부터 스티커·수채화까지. 마음에 들면 저장하거나 커뮤니티에 자랑해 보세요.'}
            </p>
          </div>
          {isLoggedIn && (
            <div className="flex flex-col items-start gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-850">
                {allowance
                  ? PLAYGROUND_BILLING_ENABLED
                    ? `이용 가능 ${remaining}회 · 오늘 무료 ${allowance.freeRemaining}/${allowance.dailyFreeLimit}회`
                    : `오늘 무료 ${allowance.freeRemaining}/${allowance.dailyFreeLimit}회`
                  : quotaError
                    ? '이용 가능 횟수를 확인하지 못했어요'
                    : '이용 가능 횟수를 확인하고 있어요…'}
              </span>
              {quotaError && (
                <Button intent="link" size="sm" onClick={onRefreshQuota}>
                  다시 확인
                </Button>
              )}
              {PLAYGROUND_BILLING_ENABLED && (
                <Link
                  href="/playground"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-700 underline focus-ring"
                >
                  놀이터 이용권 확인하기
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 tab:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] tab:gap-10">
        {/* 1. 사진 */}
        <section aria-labelledby="ai-photo-heading" className="min-w-0">
          <ComposerSectionHeading id="ai-photo-heading" step={1} required>
            {gameCharacter ? '캐릭터로 만들 사진' : '우리 아이 사진'}
          </ComposerSectionHeading>
          {isLoggedIn ? (
            <>
              <PhotoUploadField
                preview={photo?.url}
                selectLabel="우리 아이 사진 선택"
                // 모바일에서는 낮은 칸으로 두어 필터 목록이 첫 화면에 더 보이게 한다.
                frameClassName="aspect-[4/3] tab:aspect-square"
                processing={preparing}
                disabled={ai.isWorking || awaitingResult}
                onSelect={(files) => void selectPhoto(files)}
                onRemove={() => {
                  ai.reset()
                  clearPhoto()
                }}
              />
              {photoError && (
                <p role="alert" className="mt-3 text-sm text-error-500">
                  {photoError}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-700">
                {gameCharacter
                  ? '몸과 꼬리까지 잘 보이는 사진을 권해요. 얼굴만 보이는 사진은 몸의 무늬를 AI가 추정해요.'
                  : '얼굴이 잘 보이는 정면 사진일수록 우리 아이와 닮게 나와요.'}
              </p>
              {gameCharacter && (
                <Link
                  href="#ai-archive-heading"
                  className="mt-3 inline-block text-sm font-semibold text-primary-700 underline focus-ring"
                >
                  내 AI 사진에서 고르기
                </Link>
              )}
              {gameCharacter && photo?.fromArchive && (
                <p className="mt-2 text-xs text-neutral-700">
                  보관함의 AI 사진을 가져왔어요. 원래 사진은 그대로 보관돼요.
                </p>
              )}
            </>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-xl border border-primary-200 bg-point-50 p-6 text-center tab:aspect-square">
              <p className="text-sm font-semibold text-neutral-850">
                로그인하면 우리 아이 사진으로 바로 만들어 볼 수 있어요
              </p>
              <Link
                href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className={buttonVariants()}
              >
                로그인하고 시작하기
              </Link>
            </div>
          )}
        </section>

        {/* 2. 필터 */}
        {/* 고정 헤더 아래로 숨지 않도록 이동 위치를 헤더 높이만큼 띄운다. */}
        <section aria-labelledby="ai-filter-heading" className="min-w-0 scroll-mt-24">
          <ComposerSectionHeading id="ai-filter-heading" step={2} required>
            {gameCharacter ? '캐릭터 만들기' : '필터 고르기'}
          </ComposerSectionHeading>
          {ai.filtersState === 'loading' ? (
            // 실제 필터 카드와 같은 격자·비율의 빈 카드로 자리를 잡아 둔다.
            <div role="status" aria-busy="true">
              <span className="sr-only">필터 목록을 불러오고 있어요.</span>
              <div className="grid grid-cols-2 gap-3 pc:grid-cols-3" aria-hidden>
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border-2 border-neutral-150"
                  >
                    <SkeletonBlock className="aspect-square w-full rounded-none" />
                    <div className="space-y-1.5 p-3">
                      <SkeletonBlock className="h-4 w-2/3 rounded" />
                      <SkeletonBlock className="h-3 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : ai.filtersState === 'error' ? (
            <AsyncState
              status="error"
              message="필터 목록을 불러오지 못했어요. 고른 사진은 그대로 있어요."
              onRetry={ai.retryFilters}
              isRetrying={ai.isRetryingFilters}
            />
          ) : ai.filters.length === 0 ? (
            <p className="rounded-xl bg-neutral-50 p-5 text-sm text-neutral-700">
              지금은 쓸 수 있는 필터가 없어요. 곧 새 필터로 찾아올게요!
            </p>
          ) : gameCharacter ? (
            <div className="rounded-xl border-2 border-primary-200 bg-point-50 p-5 text-sm leading-6 text-neutral-850">
              <strong>게임 속 도트 친구</strong>
              <p>
                작은 머리와 통통한 몸, 발·꼬리가 또렷한 고전 게임 모습이에요. 배경 없이 우리 아이만
                그려요.
              </p>
              <p className="mt-3 text-xs text-neutral-700">
                만들기를 누르면 기존 AI 이용 횟수 1회를 사용해요. 완성된 그림을 확인한 뒤 직접
                연결할 수 있어요.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 pc:grid-cols-3" aria-label="필터 목록">
              {ai.filters.map((filter) => {
                const selected = filter.filterId === ai.selectedFilterId
                return (
                  <li key={filter.filterId}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={ai.isWorking || awaitingResult}
                      onClick={() => ai.selectFilter(filter.filterId)}
                      className={cn(
                        'relative flex w-full flex-col overflow-hidden rounded-xl border-2 bg-white text-left focus-ring transition-colors disabled:cursor-not-allowed',
                        selected
                          ? 'border-primary-500'
                          : 'border-neutral-150 hover:border-primary-200',
                      )}
                    >
                      <span className="relative block aspect-square w-full bg-point-100">
                        {filter.thumbnailUrl ? (
                          <Image
                            src={filter.thumbnailUrl}
                            alt=""
                            fill
                            // 관리자가 올린 원본(수 MB)을 그대로 받지 않도록 최적화를 거친다.
                            // 필터 목록은 첫 화면의 핵심 선택지라 지연 로딩으로 빈 칸이 보이지 않게 한다.
                            loading="eager"
                            sizes="(min-width: 1024px) 200px, 45vw"
                            className="object-cover"
                          />
                        ) : (
                          // 예시 이미지가 아직 없는 필터도 빈 칸 대신 놀이터 예시 자리와 같은 발바닥으로 채운다.
                          <span className="flex size-full items-center justify-center" aria-hidden>
                            <PawPrintIcon className="size-12 rotate-12 text-secondary-300" />
                          </span>
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
                  : ai.phase === 'checking'
                    ? '귀여운 우리 아이가 잘 보이는지 확인하고 있어요…'
                    : ai.phase === 'reconnecting'
                      ? '연결이 잠시 불안정해요. 같은 사진의 결과를 다시 확인하고 있어요…'
                      : `${WAITING_TIPS[Math.min(WAITING_TIPS.length - 1, Math.floor(elapsed / 12))]}… ${elapsed}초`}
              </p>
              <p className="mt-0.5 text-xs text-neutral-700">
                {ai.phase === 'checking'
                  ? '사진 확인에는 생성 횟수를 쓰지 않아요.'
                  : ai.phase === 'reconnecting'
                    ? '사진을 새로 만들지 않으므로 생성 횟수를 추가로 쓰지 않아요.'
                    : '보통 30초~1분 걸려요.'}
              </p>
            </div>
          ) : awaitingResult ? (
            <div role="status" className="rounded-2xl border border-primary-200 bg-point-50 p-5">
              <p className="text-sm font-semibold text-neutral-850">결과 확인이 필요해요</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{ai.error}</p>
              <p className="mt-2 text-xs text-neutral-700">
                접수된 작업은 화면 연결이 끊겨도 계속 진행돼요. 완성되면 보관함에 저장돼요.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ai.canResume && <Button onClick={() => void checkResult()}>결과 다시 확인</Button>}
                <Link
                  href="/home?tab=ai-photos"
                  className={buttonVariants({ intent: 'secondary' })}
                >
                  보관함 확인
                </Link>
                <Button
                  intent="link"
                  onClick={() => {
                    ai.reset()
                    clearPhoto()
                  }}
                >
                  새 사진 선택
                </Button>
              </div>
            </div>
          ) : result && photo ? (
            <div className="space-y-5 rounded-2xl border border-neutral-150 bg-white p-4 tab:space-y-6 tab:p-6">
              <h2
                className={cn(
                  cafe24Proup.className,
                  'text-center font-cafe24 text-xl leading-relaxed font-bold text-primary-500',
                )}
              >
                짜잔! {gameCharacter ? '우리 아이 캐릭터' : (selectedFilter?.name ?? 'AI 필터')}{' '}
                완성
              </h2>
              {gameCharacter ? (
                <div className="rounded-xl border-2 border-primary-200 bg-point-50 px-6 py-5 tab:py-6">
                  <Image
                    src={result.imageUrl}
                    alt="완성된 우리 아이 게임 캐릭터"
                    width={288}
                    height={288}
                    unoptimized
                    className="mx-auto aspect-square w-full max-w-60 object-contain [image-rendering:pixelated]"
                  />
                </div>
              ) : (
                <BeforeAfterCompare beforeSrc={photo.url} afterSrc={result.imageUrl} />
              )}
              {renderResultAction?.(result.jobId, 'mt-0')}
              <AiPostShareChoice
                checked={shareComparison}
                onChange={setShareComparison}
                disabled={saving}
              />
              {shareError && (
                <p role="alert" className="text-sm text-error-500">
                  {shareError}
                </p>
              )}
              <p className="text-center text-xs leading-relaxed text-neutral-700">
                {gameCharacter
                  ? '우리 아이와 닮았는지 확인해 주세요. 보관함에도 저장됐어요.'
                  : '가운데 손잡이를 끌어 원본과 비교해 보세요. 보관함에도 저장됐어요.'}
              </p>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <Button intent="secondary" size="lg" disabled={saving} onClick={() => void save()}>
                  {saving ? '준비 중…' : '저장하기'}
                </Button>
                <Button size="lg" onClick={postToCommunity}>
                  커뮤니티에 자랑하기
                </Button>
              </div>
              <div className="flex justify-center">
                <Button
                  size="md"
                  intent="link"
                  disabled={!canGenerate}
                  onClick={() => {
                    ai.reset()
                    document
                      .getElementById('ai-filter-heading')
                      ?.closest('section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {gameCharacter ? '새 사진으로 다시 만들기' : '다른 필터로 또 만들기'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 모바일 하단 고정 버튼은 이 버튼이 화면 밖에 있을 때만 나타난다. */}
              <div ref={ctaRef}>
                <Button
                  size="lg"
                  disabled={!canConvert}
                  onClick={() => void convert()}
                  width="full"
                >
                  {generateLabel}
                </Button>
              </div>
              {!photo && (
                <p className="mt-2 text-center text-xs text-neutral-700">
                  먼저 우리 아이 사진을 올려 주세요.
                </p>
              )}
              <p className="mt-3 text-center text-xs leading-relaxed text-neutral-700">
                필터를 씌우면 포퐁 AI가 사진 속 동물을 확인한 뒤 변환해요. 동물이 잘 보이지 않는
                사진은 생성 횟수를 사용하지 않아요.
              </p>
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
            <h2 id="ai-archive-heading" className="scroll-mt-24 text-lg font-bold text-neutral-850">
              내 AI 사진
            </h2>
            <Link
              href="/home?tab=ai-photos"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-700 focus-ring"
            >
              보관함
              <PixelArrowRightIcon aria-hidden className="ml-1.5 size-3" />
            </Link>
          </div>
          <AiPhotoArchive
            enabled={isLoggedIn}
            limit={8}
            moreHref="/home?tab=ai-photos"
            renderResultAction={renderResultAction}
          />
        </section>
      )}

      {showFloatingCta && (
        // 하단 메뉴 바로 위에 띄운다. 누르면 진행 상황이 보이는 자리로 옮긴 뒤 만든다.
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-sticky bg-gradient-to-t from-base-white via-base-white/95 to-transparent px-4 pt-6 pb-3 tab:hidden">
          <Button
            size="lg"
            width="full"
            onClick={() => {
              resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              void convert()
            }}
          >
            {generateLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
