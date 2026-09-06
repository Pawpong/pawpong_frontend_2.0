'use client'

import { useSyncExternalStore } from 'react'
import { AUTH_STATE_CHANGED } from '@/shared/lib/authStateEvents'

/**
 * 클라이언트 쿠키 기반 로그인 상태 훅
 *
 * 현재 프론트에는 전역 auth 스토어가 없고 인증은 쿠키로만 유지된다.
 * (set-cookie BFF 가 accessToken/userRole 을 httpOnly=false 로 심음 → JS 에서 읽기 가능)
 * 이 훅이 그 쿠키를 읽어 GNB 등에서 로그인/비로그인 UI 를 분기하게 해준다.
 *
 * 구현: 쿠키는 React 외부의 가변 상태이므로 useSyncExternalStore 로 읽는다.
 * - 서버 렌더/하이드레이션 동안에는 getServerSnapshot('') 사용 → 비로그인으로 일관 → hydration mismatch 없음
 * - 하이드레이션 후 클라이언트 스냅샷(실제 쿠키)으로 전환되어 자동 재렌더
 * - 로그인 성공 후 /login/success → /explore 진입 시 GNB 가 새로 마운트되며 쿠키를 다시 읽음
 * - 탭 재포커스·뒤로가기·BFCache 복원 시에도 실제 쿠키를 다시 평가
 *
 * TODO(FE): 추후 전역 auth 스토어(zustand 등) 도입 시 이 훅을 스토어 셀렉터로 대체.
 */
type AuthStatus = {
  isReady: boolean
  isLoggedIn: boolean
  userRole: string | null
}

const readCookie = (name: string): string => {
  if (typeof document === 'undefined') return ''
  const prefix = `${name}=`
  const found = document.cookie.split('; ').find((row) => row.startsWith(prefix))
  return found ? decodeURIComponent(found.slice(prefix.length)) : ''
}

// 쿠키 변경을 직접 감지하는 표준 이벤트는 없으므로 브라우저 재진입 이벤트에서 다시 읽는다.
const subscribe = (onChange: () => void) => {
  window.addEventListener(AUTH_STATE_CHANGED, onChange)
  window.addEventListener('focus', onChange)
  window.addEventListener('pageshow', onChange)
  window.addEventListener('popstate', onChange)
  document.addEventListener('visibilitychange', onChange)

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, onChange)
    window.removeEventListener('focus', onChange)
    window.removeEventListener('pageshow', onChange)
    window.removeEventListener('popstate', onChange)
    document.removeEventListener('visibilitychange', onChange)
  }
}

const getAccessTokenSnapshot = () => readCookie('accessToken')
const getUserRoleSnapshot = () => readCookie('userRole')
const getServerSnapshot = () => ''
const subscribeHydration = () => () => undefined
const getClientReadySnapshot = () => true
const getServerReadySnapshot = () => false

export const useAuthStatus = (): AuthStatus => {
  const isReady = useSyncExternalStore(
    subscribeHydration,
    getClientReadySnapshot,
    getServerReadySnapshot,
  )
  const accessToken = useSyncExternalStore(subscribe, getAccessTokenSnapshot, getServerSnapshot)
  const userRole = useSyncExternalStore(subscribe, getUserRoleSnapshot, getServerSnapshot)

  return {
    isReady,
    isLoggedIn: Boolean(accessToken),
    userRole: userRole || null,
  }
}
