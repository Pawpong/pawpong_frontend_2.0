/** 토큰 값은 이벤트에 싣지 않는다. 구독자는 현재 쿠키를 다시 읽는다. */
export const AUTH_STATE_CHANGED = 'pawpong:auth-state-changed'

export const notifyAuthStateChanged = () => {
  try {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem(AUTH_STATE_CHANGED, `${Date.now()}-${Math.random()}`)
  } catch {
    /* 저장소가 차단된 환경에서도 현재 문서 구독자는 갱신한다. */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_STATE_CHANGED))
}
