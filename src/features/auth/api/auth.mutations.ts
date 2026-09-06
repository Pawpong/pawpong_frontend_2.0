'use client'

import { useMutation } from '@tanstack/react-query'
import { logout, reactivateAccount } from './auth.api'

export const useLogout = () => useMutation({ mutationFn: logout })

/**
 * 탈퇴 계정 복구 — 성공하면 소셜 로그인과 동일한 토큰 세트를 돌려준다.
 * 호출부에서 saveAuthTokens 로 쿠키에 심어야 로그인 상태가 된다.
 */
export const useReactivateAccount = () =>
  useMutation({ mutationFn: (reactivationToken: string) => reactivateAccount(reactivationToken) })
