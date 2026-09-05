'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStatus } from '@/features/auth'

/** 로그인한 회원의 일반 가입 진입은 홈으로. 새 OAuth 가입 세션은 별도로 허용한다. */
export const SignupEntryGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const params = useSearchParams()
  const { isReady, isLoggedIn } = useAuthStatus()
  const shouldRedirect = isReady && isLoggedIn && !params.get('tempId')

  useEffect(() => {
    if (shouldRedirect) router.replace('/')
  }, [shouldRedirect, router])

  if (!isReady || shouldRedirect) return null
  return children
}
