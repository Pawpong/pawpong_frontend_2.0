'use client'

import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/entities/profile'
import { useAuthStatus } from './useAuthStatus'

/**
 * [refactored] 로그인 사용자의 프로필.
 * `useAuthStatus` + `useQuery(profileQueries.me(), { enabled })` 조합이 화면마다 반복되던 것을 모았다.
 * 비로그인일 때 조회하면 401로 떨어지므로 로그인 상태에서만 요청한다.
 */
const useMe = () => {
  const { isLoggedIn } = useAuthStatus()
  const { data: me } = useQuery({
    ...profileQueries.me(),
    enabled: isLoggedIn,
    refetchOnMount: 'always',
    throwOnError: false,
  })

  return { isLoggedIn, me }
}

export { useMe }
