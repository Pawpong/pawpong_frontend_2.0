import { PET_ASSET_TIMEOUT_MS } from '../constants/pet-assets'

export async function withPetAssetDeadline<T>(
  signal: AbortSignal,
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (signal.aborted) throw new DOMException('화면을 떠나 준비를 취소했어요.', 'AbortError')
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  let cancel = () => {}
  try {
    return await new Promise<T>((resolve, reject) => {
      cancel = () => {
        reject(new DOMException('화면을 떠나 준비를 취소했어요.', 'AbortError'))
        controller.abort()
      }
      signal.addEventListener('abort', cancel, { once: true })
      timer = setTimeout(() => {
        reject(new Error('그림 준비 시간이 길어졌어요. 다시 시도해 주세요.'))
        controller.abort()
      }, PET_ASSET_TIMEOUT_MS)
      // 응답 본문이나 이미지 디코딩까지 같은 제한 시간과 취소 범위에 둔다.
      Promise.resolve()
        .then(() => {
          if (controller.signal.aborted) throw new DOMException('취소됨', 'AbortError')
          return operation(controller.signal)
        })
        .then(resolve, reject)
    })
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', cancel)
  }
}
