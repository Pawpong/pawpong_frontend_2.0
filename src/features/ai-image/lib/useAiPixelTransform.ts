'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAiImageGeneration,
  requestAiImageGeneration,
  uploadAiImageSource,
} from '@/entities/ai-image'

/** 에이전트가 한 건씩 처리해 보통 30~60초, 대기열이 있으면 더 걸린다 */
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 4 * 60 * 1000

export type AiPixelTransformPhase = 'idle' | 'uploading' | 'generating' | 'done' | 'failed'

export interface AiPixelTransformResult {
  imageUrl: string
  /** 콘테스트 출품 API 의 photoFileName 으로 그대로 넘기는 파일키 */
  objectKey: string
}

/** 서버 errorCode → 사용자 문구. 운영 사정(키 미설정 등)은 뭉뚱그려 안내한다 */
const ERROR_MESSAGES: Record<string, string> = {
  INPUT_TOO_LARGE: '사진이 너무 커요. 10MB 이하 사진으로 다시 시도해 주세요.',
  INPUT_DOWNLOAD_FAILED: '사진을 읽지 못했어요. 다른 사진으로 다시 시도해 주세요.',
  QUEUE_UNAVAILABLE: '지금은 변환을 시작할 수 없어요. 잠시 후 다시 시도해 주세요.',
}
const DEFAULT_ERROR = '도트 변환에 실패했어요. 잠시 후 다시 시도해 주세요.'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  const operation = useRef(0)

  useEffect(
    () => () => {
      operation.current += 1
    },
    [],
  )

  const reset = useCallback(() => {
    operation.current += 1
    setPhase('idle')
    setResult(null)
    setError(null)
  }, [])

  const transform = useCallback(
    async ({ file, filterId, contestId }: { file: File; filterId: string; contestId?: string }) => {
      const current = ++operation.current
      const isCurrent = () => current === operation.current
      setResult(null)
      setError(null)
      setPhase('uploading')

      try {
        const { inputObjectKey } = await uploadAiImageSource(file)
        if (!isCurrent()) return
        setPhase('generating')

        let job = await requestAiImageGeneration({ filterId, inputObjectKey, contestId })
        const deadline = Date.now() + POLL_TIMEOUT_MS
        while (job.status !== 'succeeded' && job.status !== 'failed') {
          if (Date.now() > deadline)
            throw new Error('변환이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.')
          await wait(POLL_INTERVAL_MS)
          if (!isCurrent()) return
          job = await getAiImageGeneration(job.jobId)
        }
        if (!isCurrent()) return

        if (job.status === 'succeeded' && job.resultImageUrl && job.resultObjectKey) {
          setResult({ imageUrl: job.resultImageUrl, objectKey: job.resultObjectKey })
          setPhase('done')
        } else {
          setError(ERROR_MESSAGES[job.errorCode ?? ''] ?? DEFAULT_ERROR)
          setPhase('failed')
        }
      } catch (err) {
        if (!isCurrent()) return
        setError(err instanceof Error && err.message ? err.message : DEFAULT_ERROR)
        setPhase('failed')
      }
    },
    [],
  )

  return {
    phase,
    result,
    error,
    isWorking: phase === 'uploading' || phase === 'generating',
    transform,
    reset,
  }
}
