'use client'

import { useCallback } from 'react'
import { useLogout } from '../api/auth.mutations'
import { AuthCookieSessionChangedError } from '@/shared/lib/authCookieScope'

/**
 * 현재 세션의 로그아웃은 실패해도 홈으로 이동하되 새 로그인 흐름은 가로채지 않는다.
 *
 * 후처리를 mutate() 의 콜백이 아니라 mutateAsync 프로미스에 붙인다 —
 * mutate() 에 넘긴 onSettled 는 옵저버에 리스너가 남아 있을 때만 실행되므로
 * (query-core MutationObserver 가 hasListeners() 로 가드),
 * 전체 메뉴처럼 클릭과 동시에 닫히며 언마운트되는 화면에서는
 * 쿠키 정리와 이동이 통째로 건너뛰어져 로그아웃이 안 먹는 것처럼 보였다.
 * 옵저버가 빠져도 뮤테이션 자체는 중단되지 않으므로 프로미스는 그대로 완료된다.
 */
const useLogoutAndRedirect = () => {
  const { mutateAsync: logout, isPending } = useLogout()

  const logoutAndRedirect = useCallback(() => {
    void (async () => {
      try {
        await logout()
      } catch (error) {
        if (error instanceof AuthCookieSessionChangedError) return
        // 서버 로그아웃이 실패해도 로컬 세션 정리와 이동은 그대로 진행한다
      }
      window.location.assign('/')
    })()
  }, [logout])

  return { logoutAndRedirect, isPending }
}

export { useLogoutAndRedirect }
