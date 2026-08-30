'use client'

import { useCallback } from 'react'
import { useLogout } from '../api/auth.mutations'

/** 로그아웃 성공 여부와 무관하게 로컬 인증 쿠키를 비우고 홈으로 이동한다. */
const useLogoutAndRedirect = () => {
  const { mutate: logout, isPending } = useLogout()

  const logoutAndRedirect = useCallback(() => {
    logout(undefined, {
      onSettled: async () => {
        await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
        window.location.assign('/')
      },
    })
  }, [logout])

  return { logoutAndRedirect, isPending }
}

export { useLogoutAndRedirect }
