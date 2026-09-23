type NativeCapability = 'cameraPermission' | 'nativeShare'
type NativeWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void }
  __PAWPONG_APP__?: { capabilities?: Partial<Record<NativeCapability, boolean>> }
}
let requestSequence = 0

export function hasNativeCapability(capability: NativeCapability): boolean {
  if (typeof window === 'undefined') return false
  const native = window as NativeWindow
  return Boolean(native.ReactNativeWebView && native.__PAWPONG_APP__?.capabilities?.[capability])
}

/** 응답 없는 구버전에는 메시지를 보내지 않는다. iOS/Android의 두 수신 경로를 모두 지원한다. */
function requestNative(
  capability: NativeCapability,
  type: string,
  responseType: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<Record<string, unknown>> {
  if (!hasNativeCapability(capability))
    return Promise.reject(new Error('지원하지 않는 기능입니다.'))
  const requestId = `web-${Date.now()}-${++requestSequence}`
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      document.removeEventListener('message', onMessage as EventListener)
    }
    const onMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (!data || data.type !== responseType || data.requestId !== requestId) return
        cleanup()
        resolve(data)
      } catch {
        /* 다른 프레임 메시지는 무시한다. */
      }
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('앱의 응답을 확인하지 못했습니다. 다시 시도해주세요.'))
    }, timeoutMs)
    window.addEventListener('message', onMessage)
    document.addEventListener('message', onMessage as EventListener)
    try {
      ;(window as NativeWindow).ReactNativeWebView!.postMessage(
        JSON.stringify({ ...payload, type, requestId }),
      )
    } catch {
      cleanup()
      reject(new Error('앱에 요청을 전달하지 못했습니다.'))
    }
  })
}

export async function requestCameraPermission(): Promise<boolean> {
  const response = await requestNative(
    'cameraPermission',
    'REQUEST_CAMERA_PERMISSION',
    'CAMERA_PERMISSION_RESULT',
    {},
    30_000,
  )
  return response.granted === true
}

export async function shareNatively(payload: {
  url: string
  title: string
  message?: string
}): Promise<'shared' | 'dismissed'> {
  const response = await requestNative('nativeShare', 'SHARE', 'SHARE_RESULT', payload, 60_000)
  if (response.status === 'shared' || response.status === 'dismissed') return response.status
  throw new Error('공유하지 못했습니다. URL 복사로 다시 시도해주세요.')
}

export function subscribeNativeCapabilities(onChange: () => void): () => void {
  window.addEventListener('pawpong:app-ready', onChange)
  return () => window.removeEventListener('pawpong:app-ready', onChange)
}
