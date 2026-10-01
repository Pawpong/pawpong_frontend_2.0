'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NotificationResponseDto } from '@/shared/types'
import { useMarkAsRead } from '../api/notification.mutations'

export function resolveNotificationTargetUrl(targetUrl?: string): string | null {
  if (
    !targetUrl?.startsWith('/') ||
    targetUrl.startsWith('//') ||
    /[\\\u0000-\u0020\u007f]/.test(targetUrl)
  )
    return null

  try {
    const url = new URL(targetUrl, 'https://notification.invalid')
    const decodedPath = decodeURIComponent(url.pathname)
    if (decodedPath.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(decodedPath)) return null

    // 이미 저장된 옛 알림도 현재 신청 상세 화면으로 연다.
    if (url.pathname === '/applications') url.pathname = '/activity'
    else if (url.pathname.startsWith('/applications/')) url.pathname = `/activity${url.pathname}`

    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

export function useOpenNotification() {
  const router = useRouter()
  const { mutateAsync: markAsRead } = useMarkAsRead()
  const selection = useRef(0)

  useEffect(
    () => () => {
      selection.current += 1
    },
    [],
  )

  return async (item: NotificationResponseDto) => {
    const selected = ++selection.current
    const sourceUrl = window.location.href
    const targetUrl = resolveNotificationTargetUrl(item.targetUrl)

    if (!item.isRead) {
      try {
        // 문서 이동이 XHR을 중단하지 않게 읽음 요청을 먼저 완료한다.
        await markAsRead(item.notificationId)
      } catch {
        // 실제 API 실패는 MutationCache가 기록한다. 읽음 실패가 상세 열기를 막지는 않는다.
      }
    }

    // 기다리는 동안 다른 알림을 골랐거나 화면을 떠났으면 이전 선택으로 이동하지 않는다.
    if (selected !== selection.current || window.location.href !== sourceUrl) return
    if (targetUrl) router.push(targetUrl)
  }
}
