type NativeCapability =
  | 'cameraPermission'
  | 'nativeShare'
  | 'notificationPermission'
  | 'notificationSettings'
  | 'appBadge'
  | 'inAppPurchase'
  | 'haptics'
type NativeWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void }
  __PAWPONG_APP__?: { platform?: string; capabilities?: Partial<Record<NativeCapability, boolean>> }
}
let requestSequence = 0

/**
 * 앱과 주고받는 탭 바·진동 메시지 이름. 앱(pawpong_rn features/native-tabs)의 NATIVE_MESSAGE 와 같아야 하고,
 * 양쪽 테스트가 같은 예시(tests/fixtures/native-tab-messages.json)로 이 약속을 확인한다.
 */
export const NATIVE_MESSAGE = {
  /** 웹 → 앱: 탭 목록·라벨·아이콘 그림 (페이지를 열 때 한 번) */
  TAB_CONFIG: 'TAB_CONFIG',
  /** 웹 → 앱: 지금 탭·보임 여부·채팅 수·프로필 사진 (화면이 바뀔 때마다) */
  TAB_STATE: 'TAB_STATE',
  /** 앱 → 웹: 탭을 눌렀다 */
  NAVIGATE_TAB: 'NAVIGATE_TAB',
  /** 웹 → 앱: 손끝 진동 */
  HAPTIC: 'HAPTIC',
} as const

// [refactored] requestNative·subscribeNativeMessage 가 같이 쓰는 앱 메시지 확인 — 같은 창·같은 출처의 JSON 만 받는다
const readNativeMessage = (event: MessageEvent): Record<string, unknown> | null => {
  if (event.source && event.source !== window) return null
  if (event.origin && event.origin !== window.location?.origin) return null
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    return data && typeof data === 'object' ? data : null
  } catch {
    return null // 다른 프레임 메시지는 무시한다.
  }
}

export function hasNativeCapability(capability: NativeCapability): boolean {
  if (typeof window === 'undefined') return false
  const native = window as NativeWindow
  return Boolean(native.ReactNativeWebView && native.__PAWPONG_APP__?.capabilities?.[capability])
}

/** 응답 없는 구버전에는 메시지를 보내지 않는다. iOS/Android의 두 수신 경로를 모두 지원한다. */
export function requestNative(
  capability: NativeCapability,
  type: string,
  responseType: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  if (!hasNativeCapability(capability))
    return Promise.reject(new Error('지원하지 않는 기능입니다.'))
  const requestId = `web-${Date.now()}-${++requestSequence}`
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      document.removeEventListener('message', onMessage as EventListener)
      signal?.removeEventListener('abort', onAbort)
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const onMessage = (event: MessageEvent) => {
      const data = readNativeMessage(event) // [refactored]
      if (!data || data.type !== responseType || data.requestId !== requestId) return
      cleanup()
      resolve(data)
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('앱의 응답을 확인하지 못했습니다. 다시 시도해주세요.'))
    }, timeoutMs)
    window.addEventListener('message', onMessage)
    document.addEventListener('message', onMessage as EventListener)
    signal?.addEventListener('abort', onAbort, { once: true })
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

/** 포퐁 앱의 WebView 안에서 열린 화면인지. 앱 준비 신호 전에도 브리지 객체로 판단한다. */
export function inNativeAppWebView(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as NativeWindow).ReactNativeWebView) || getNativePlatform() !== null
}

export function getNativePlatform(): 'ios' | 'android' | null {
  if (typeof window === 'undefined') return null
  const platform = (window as NativeWindow).__PAWPONG_APP__?.platform
  return platform === 'ios' || platform === 'android' ? platform : null
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

/** 앱이 하단 탭 바를 직접 그리는지 (UA 의 PawpongTabs/ — 루트 레이아웃이 data-native-tabs 로 표시한다). */
export function hasNativeTabBar(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(
    (window as NativeWindow).ReactNativeWebView &&
    document.documentElement.dataset.nativeTabs !== undefined,
  )
}

/** 좋아요처럼 누른 순간을 손끝으로 알린다. 지원하지 않는 앱·브라우저에서는 아무것도 하지 않는다. */
export function nativeHaptic(style: 'selection' | 'light'): void {
  if (hasNativeCapability('haptics')) postNativeMessage({ type: NATIVE_MESSAGE.HAPTIC, style })
}

/** 응답을 기다리지 않는 알림. 앱이 받는지는 호출부가 hasNativeTabBar 등으로 먼저 확인한다. */
export function postNativeMessage(payload: { type: string } & Record<string, unknown>): void {
  try {
    ;(window as NativeWindow).ReactNativeWebView?.postMessage(JSON.stringify(payload))
  } catch {
    /* 앱이 닫히는 중이면 보내지 못해도 화면에는 영향이 없다. */
  }
}

/** 앱이 먼저 보내는 메시지(type 일치)를 받는다. iOS/Android 의 두 수신 경로를 모두 듣는다. */
export function subscribeNativeMessage(
  type: string,
  onMessage: (data: Record<string, unknown>) => void,
): () => void {
  const listener = (event: MessageEvent) => {
    const data = readNativeMessage(event) // [refactored]
    if (data?.type === type) onMessage(data)
  }
  window.addEventListener('message', listener)
  document.addEventListener('message', listener as EventListener)
  return () => {
    window.removeEventListener('message', listener)
    document.removeEventListener('message', listener as EventListener)
  }
}

export function subscribeNativeCapabilities(onChange: () => void): () => void {
  window.addEventListener('pawpong:app-ready', onChange)
  return () => window.removeEventListener('pawpong:app-ready', onChange)
}

/** 새 앱에서만 OS 권한을 읽는다. 조회 오류를 알림 거부로 처리하지 않는다. */
export async function getNativeNotificationPermission(): Promise<boolean> {
  const response = await requestNative(
    'notificationPermission',
    'GET_NOTIFICATION_PERMISSION',
    'NOTIFICATION_PERMISSION_RESULT',
    {},
    5_000,
  )
  if (typeof response.granted !== 'boolean') throw new Error('알림 권한을 확인하지 못했습니다.')
  return response.granted
}

/** 지원하는 앱에서만 앱 아이콘 숫자를 맞춘다. 실패해도 화면에는 영향이 없어 결과를 기다리지 않는다. */
export function setNativeAppBadge(count: number): void {
  requestNative('appBadge', 'SET_APP_BADGE', 'APP_BADGE_RESULT', { count }, 5_000).catch(() => {})
}

/** 지원하는 앱에서만 포퐁의 OS 설정 화면을 연다. */
export async function openNativeNotificationSettings(): Promise<void> {
  const response = await requestNative(
    'notificationSettings',
    'OPEN_NOTIFICATION_SETTINGS',
    'OPEN_NOTIFICATION_SETTINGS_RESULT',
    {},
    5_000,
  )
  if (response.status !== 'opened') throw new Error('기기 설정을 열지 못했습니다.')
}
