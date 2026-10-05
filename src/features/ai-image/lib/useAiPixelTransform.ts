'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAiImageGeneration,
  getAiImageGenerationImage,
  requestAiImageGeneration,
  uploadAiImageSource,
} from '@/entities/ai-image'
import type { AiImageGeneration } from '@/shared/types'
import {
  AI_IMAGE_RETRY_INTERVAL_MS,
  AiImagePendingError,
  aiImageErrorMessage,
  isRetryableAiImageError,
  readAiImageWithRetry,
  waitForAiImage,
} from './aiImageRecovery'

/** 에이전트가 한 건씩 처리해 보통 30~60초, 대기열이 있으면 더 걸린다 */
const POLL_TIMEOUT_MS = 4 * 60 * 1000
const DOWNLOAD_TIMEOUT_MS = 2 * 60 * 1000

export type AiPixelTransformPhase =
  | 'idle'
  | 'uploading'
  | 'checking'
  | 'generating'
  | 'reconnecting'
  | 'pending'
  | 'done'
  | 'failed'

export interface AiPixelTransformResult {
  jobId: string
  imageUrl: string
  /** 결과 파일키 (ai-image/result/...) */
  objectKey: string
  /** 결과 PNG 를 사진 파일로 받은 것 — 글쓰기 사진 목록에 그대로 넣는다 */
  file: File
}

/** 서버 errorCode → 사용자 문구. 운영 사정(키 미설정 등)은 뭉뚱그려 안내한다 */
const ERROR_MESSAGES: Record<string, string> = {
  INPUT_TOO_LARGE: '사진이 너무 커요. 10MB 이하 사진으로 다시 시도해 주세요.',
  INPUT_DOWNLOAD_FAILED: '사진을 읽지 못했어요. 다른 사진으로 다시 시도해 주세요.',
  OPENAI_NOT_CONFIGURED: '지금은 도트 변환을 쓸 수 없어요. 잠시 후 다시 시도해 주세요.',
  QUEUE_UNAVAILABLE: '지금은 변환을 시작할 수 없어요. 잠시 후 다시 시도해 주세요.',
  PET_SPRITE_INVALID:
    '몸과 발·꼬리가 분명한 캐릭터를 완성하지 못했어요. 기존 그림은 그대로 있고, 실패한 생성은 이용 횟수에서 제외돼요.',
}
const DEFAULT_ERROR = '도트 변환에 실패했어요. 잠시 후 다시 시도해 주세요.'

/**
 * 사진 한 장을 AI 필터로 변환한다: 원본 업로드 → 생성 요청 → 상태 폴링.
 *
 * 새 변환을 시작하거나 화면을 떠나면 진행 중이던 폴링 결과는 버린다(operation 토큰).
 * 서버 작업 자체는 취소되지 않지만, 늦게 끝난 결과가 새 선택을 덮어쓰지 않게 한다.
 */
export const useAiPixelTransform = () => {
  const [phase, setPhase] = useState<AiPixelTransformPhase>('idle')
  const [result, setResult] = useState<AiPixelTransformResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canResume, setCanResume] = useState(false)
  const operation = useRef(0)
  const controller = useRef<AbortController | null>(null)
  const inFlight = useRef<Promise<AiPixelTransformResult | null> | null>(null)
  const pendingJob = useRef<AiImageGeneration | null>(null)

  useEffect(
    () => () => {
      operation.current += 1
      controller.current?.abort()
    },
    [],
  )

  const reset = useCallback(() => {
    operation.current += 1
    controller.current?.abort()
    controller.current = null
    inFlight.current = null
    pendingJob.current = null
    setCanResume(false)
    setPhase('idle')
    setResult(null)
    setError(null)
  }, [])

  const perform = useCallback(
    (input?: {
      file: File
      filterId: string
      generationPurpose?: 'pet-sprite-v1'
    }): Promise<AiPixelTransformResult | null> => {
      if (inFlight.current) return inFlight.current
      if (!input && !pendingJob.current) return Promise.resolve(null)
      const current = ++operation.current
      const isCurrent = () => current === operation.current
      const requestController = new AbortController()
      controller.current = requestController
      const { signal } = requestController
      if (input) {
        pendingJob.current = null
        setCanResume(false)
      }
      setResult(null)
      setError(null)
      setPhase(input ? 'uploading' : 'generating')

      const run = async (): Promise<AiPixelTransformResult | null> => {
        let generationRequested = !input
        try {
          if (input) {
            const { inputObjectKey } = await uploadAiImageSource(input.file, { signal })
            if (!isCurrent()) return null
            setPhase('checking')
            generationRequested = true
            // Never replay this POST: a lost response does not mean the job was rejected.
            const accepted = await requestAiImageGeneration(
              {
                filterId: input.filterId,
                inputObjectKey,
                ...(input.generationPurpose ? { generationPurpose: input.generationPurpose } : {}),
              },
              { signal },
            )
            if (!isCurrent()) return null
            pendingJob.current = accepted
            setCanResume(true)
          }

          const acceptedJob = pendingJob.current
          if (!acceptedJob) return null
          let job = acceptedJob
          setPhase('generating')
          const deadline = Date.now() + POLL_TIMEOUT_MS
          const onRetry = () => {
            if (isCurrent()) setPhase('reconnecting')
          }
          while (job.status !== 'succeeded' && job.status !== 'failed') {
            await waitForAiImage(
              Math.max(0, Math.min(AI_IMAGE_RETRY_INTERVAL_MS, deadline - Date.now())),
              signal,
            )
            job = await readAiImageWithRetry(
              (remainingMs) =>
                getAiImageGeneration(job.jobId, {
                  signal,
                  timeout: Math.min(10000, remainingMs),
                }),
              { signal, deadline, onRetry },
            )
            if (!isCurrent()) return null
            pendingJob.current = job
            setPhase('generating')
          }
          if (!isCurrent()) return null

          if (job.status !== 'succeeded' || !job.resultImageUrl || !job.resultObjectKey) {
            pendingJob.current = null
            setCanResume(false)
            setError(ERROR_MESSAGES[job.errorCode ?? ''] ?? DEFAULT_ERROR)
            setPhase('failed')
            return null
          }

          const blob = await readAiImageWithRetry(
            (remainingMs) =>
              getAiImageGenerationImage(job.jobId, {
                signal,
                timeout: Math.min(60000, remainingMs),
              }),
            { signal, deadline: Date.now() + DOWNLOAD_TIMEOUT_MS, onRetry },
          )
          if (!isCurrent()) return null
          const next: AiPixelTransformResult = {
            jobId: job.jobId,
            imageUrl: job.resultImageUrl,
            objectKey: job.resultObjectKey,
            file: new File([blob], `pawpong-dot-${job.jobId}.png`, { type: 'image/png' }),
          }
          pendingJob.current = null
          setCanResume(false)
          setResult(next)
          setPhase('done')
          return next
        } catch (err) {
          if (!isCurrent()) return null
          if (
            err instanceof AiImagePendingError ||
            (generationRequested && isRetryableAiImageError(err))
          ) {
            setError(
              pendingJob.current?.status === 'succeeded'
                ? '사진은 완성돼 보관함에 저장됐어요. 결과 다시 확인을 눌러 사진을 가져와 주세요.'
                : pendingJob.current
                  ? new AiImagePendingError().message
                  : '생성 요청의 접수 여부를 확인하지 못했어요. 다시 만들기 전에 보관함부터 확인해 주세요.',
            )
            setPhase('pending')
          } else {
            pendingJob.current = null
            setCanResume(false)
            setError(aiImageErrorMessage(err))
            setPhase('failed')
          }
          return null
        } finally {
          if (isCurrent()) {
            inFlight.current = null
            controller.current = null
          }
        }
      }
      const promise = run()
      inFlight.current = promise
      return promise
    },
    [],
  )
  const resume = useCallback(() => perform(), [perform])

  return {
    phase,
    result,
    error,
    isWorking:
      phase === 'uploading' ||
      phase === 'checking' ||
      phase === 'generating' ||
      phase === 'reconnecting',
    canResume,
    transform: perform,
    resume,
    reset,
  }
}
