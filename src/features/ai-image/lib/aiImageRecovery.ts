import { ApiError } from '@/shared/api/unwrap'

export const AI_IMAGE_RETRY_INTERVAL_MS = 3000

export class AiImagePendingError extends Error {
  constructor() {
    super('아직 결과를 확인하지 못했어요. 결과 다시 확인을 누르거나 보관함을 확인해 주세요.')
    this.name = 'AiImagePendingError'
  }
}

export const isRetryableAiImageError = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === undefined ||
    error.status === 408 ||
    error.status === 429 ||
    (error.status >= 500 && error.status <= 599))

export const waitForAiImage = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }
    const abort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })

interface AiImageReadOptions {
  signal: AbortSignal
  deadline: number
  onRetry: () => void
}

/** Only retry reads: an unanswered generation POST may already have consumed a quota slot. */
export async function readAiImageWithRetry<T>(
  read: (remainingMs: number) => Promise<T>,
  { signal, deadline, onRetry }: AiImageReadOptions,
): Promise<T> {
  while (true) {
    signal.throwIfAborted()
    const remainingMs = deadline - Date.now()
    if (remainingMs <= 0) throw new AiImagePendingError()
    try {
      const result = await read(remainingMs)
      signal.throwIfAborted()
      return result
    } catch (error) {
      signal.throwIfAborted()
      if (!isRetryableAiImageError(error)) throw error
      onRetry()
      await waitForAiImage(
        Math.max(0, Math.min(AI_IMAGE_RETRY_INTERVAL_MS, deadline - Date.now())),
        signal,
      )
    }
  }
}

export function aiImageErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401)
    return '로그인이 만료됐어요. 다시 로그인한 뒤 보관함에서 결과를 확인해 주세요.'
  if (error instanceof ApiError && error.status === 403)
    return '이 사진을 확인할 권한이 없어요. 보관함에서 본인 사진을 선택해 주세요.'
  if (error instanceof ApiError && error.status === 404)
    return '사진을 찾지 못했어요. 보관함에서 다시 확인해 주세요.'
  if (isRetryableAiImageError(error)) return '연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.'
  if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500)
    return error.message
  return '사진 변환을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
