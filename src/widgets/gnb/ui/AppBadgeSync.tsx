'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStatus } from '@/features/auth'
import { notificationQueries } from '@/entities/notification'
import { setNativeAppBadge, subscribeNativeCapabilities } from '@/shared/lib/nativeBridge'

/** 앱 아이콘 숫자를 안 읽은 알림 수와 맞춘다. 로그아웃하면 지우고, 앱으로 돌아오면 다시 센다. */
const AppBadgeSync = () => {
  const { isReady, isLoggedIn } = useAuthStatus()
  const { data, refetch } = useQuery({ ...notificationQueries.unreadCount(), enabled: isLoggedIn })
  const count = isLoggedIn ? data : 0

  useEffect(() => {
    if (!isReady || count === undefined) return
    const sync = () => setNativeAppBadge(count)
    sync()
    // 앱 기능이 늦게 주입돼도 한 번 더 맞춘다.
    return subscribeNativeCapabilities(sync)
  }, [isReady, count])

  useEffect(() => {
    if (!isLoggedIn) return
    const refresh = () => void refetch()
    window.addEventListener('pawpong:app-active', refresh)
    return () => window.removeEventListener('pawpong:app-active', refresh)
  }, [isLoggedIn, refetch])

  return null
}

export { AppBadgeSync }
