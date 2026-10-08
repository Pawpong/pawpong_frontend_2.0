import { withPetAssetDeadline } from './petAssetDeadline'

export function loadPetAssetImage(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return withPetAssetDeadline(
    signal,
    (request) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        let settled = false
        const finish = (error?: Error) => {
          if (settled) return
          settled = true
          image.onload = null
          image.onerror = null
          request.removeEventListener('abort', cancel)
          if (error) {
            image.src = ''
            reject(error)
          } else resolve(image)
        }
        const cancel = () => finish(new DOMException('그림 준비를 취소했어요.', 'AbortError'))
        image.onload = () => finish()
        image.onerror = () => finish(new Error('그림을 불러오지 못했어요.'))
        request.addEventListener('abort', cancel, { once: true })
        if (request.aborted) cancel()
        else image.src = url
      }),
  )
}
