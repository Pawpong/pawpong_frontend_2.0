/** 토큰 값은 이벤트에 싣지 않는다. 구독자는 현재 쿠키를 다시 읽는다. */
export const AUTH_STATE_CHANGED = 'pawpong:auth-state-changed'

export const notifyAuthStateChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_STATE_CHANGED))
}
