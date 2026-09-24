import { getAccessToken } from '@/shared/api/token'
import { AUTH_STATE_CHANGED } from './authStateEvents'
import { isAuthSessionCurrent } from './authSessionLifecycle'

let logoutRequestSequence = 0

type NativeWindow = Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }

function getBridge() {
  return typeof window === 'undefined' ? undefined : (window as NativeWindow).ReactNativeWebView
}

/** 로그인·가입·쿠키 갱신·앱 재실행 시 현재 세션을 네이티브 푸시 등록에 전달한다. */
export function subscribeNativePushSession(): () => void {
  let lastToken: string | null | undefined
  const sync = () => {
    const bridge = getBridge()
    if (!isAuthSessionCurrent()) {
      // 탈퇴 요청이 실패해 같은 인증 세션으로 돌아와도 네이티브 연결을 다시 등록한다.
      lastToken = undefined
      return
    }
    if (!bridge || document.visibilityState === 'hidden') return
    const accessToken = getAccessToken()
    if (accessToken === lastToken) return
    lastToken = accessToken
    if (accessToken) {
      bridge.postMessage(JSON.stringify({ type: 'REQUEST_FCM_TOKEN', accessToken }))
    } else {
      bridge.postMessage(JSON.stringify({ type: 'UNREGISTER_FCM_TOKEN' }))
    }
  }
  const ready = () => {
    lastToken = undefined
    sync()
  }
  sync()
  window.addEventListener(AUTH_STATE_CHANGED, sync)
  window.addEventListener('pawpong:app-ready', ready)
  window.addEventListener('pageshow', ready)
  document.addEventListener('visibilitychange', sync)
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, sync)
    window.removeEventListener('pawpong:app-ready', ready)
    window.removeEventListener('pageshow', ready)
    document.removeEventListener('visibilitychange', sync)
  }
}

/** 서버가 세션을 폐기하기 전에 푸시 연결을 해제한다. 구버전 앱도 시간 제한 후 로그아웃된다. */
export async function unregisterNativePushSession(): Promise<void> {
  const bridge = getBridge()
  if (!bridge) return
  const requestId = `logout-${Date.now()}-${++logoutRequestSequence}`
  await new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      document.removeEventListener('message', onMessage as EventListener)
      resolve()
    }
    const onMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.type === 'FCM_TOKEN_UNREGISTERED' && data.requestId === requestId) finish()
      } catch {
        /* 다른 WebView 메시지는 무시한다. */
      }
    }
    const timer = setTimeout(finish, 4500)
    window.addEventListener('message', onMessage)
    document.addEventListener('message', onMessage as EventListener)
    try {
      bridge.postMessage(JSON.stringify({ type: 'UNREGISTER_FCM_TOKEN', requestId }))
    } catch {
      finish()
    }
  })
}
