'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { inNativeAppWebView } from '@/shared/lib/nativeBridge'

// 이만큼 끌어내렸다 놓으면 새로고침한다. 손가락 이동의 절반만 표시해 고무줄처럼 느리게 따라온다
const TRIGGER = 72
const MAX_PULL = 96

// 손가락 아래 안쪽 스크롤 영역(채팅 목록 등)이 내려가 있으면 그 영역을 올리는 동작으로 둔다
const isScrolledInside = (target: EventTarget | null) => {
  for (
    let node = target as HTMLElement | null;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (node.scrollTop > 0) return true
  }
  return false
}

/**
 * 앱(웹뷰) 전용 당겨서 새로고침. 브라우저는 자체 기능이 있어 앱에서만 켠다.
 * 문서 맨 위에서 아래로 끌어내리면 동그라미가 따라 내려오고, 놓으면 화면을 처음부터 다시 받지 않고
 * 지금 화면의 데이터(서버 컴포넌트·쿼리)만 새로 받는다.
 * 모달이 열렸거나(스크롤 잠금) 안쪽 스크롤 영역이 내려가 있으면 그 영역의 스크롤로 둔다.
 */
const AppPullToRefresh = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    if (!inNativeAppWebView()) return

    const onStart = (event: TouchEvent) => {
      const blocked =
        refreshing ||
        window.scrollY > 0 ||
        document.body.hasAttribute('data-scroll-locked') ||
        isScrolledInside(event.target)
      startY.current = blocked ? null : event.touches[0].clientY
    }
    const onMove = (event: TouchEvent) => {
      if (startY.current === null) return
      const next = Math.min(Math.max((event.touches[0].clientY - startY.current) / 2, 0), MAX_PULL)
      pullRef.current = next
      setPull(next)
    }
    const onEnd = () => {
      if (startY.current === null) return
      startY.current = null
      const shouldRefresh = pullRef.current >= TRIGGER / 2
      pullRef.current = 0
      setPull(0)
      if (!shouldRefresh) return
      setRefreshing(true)
      router.refresh()
      void queryClient
        .invalidateQueries()
        // 너무 빨리 끝나도 돌았다는 걸 알아볼 만큼은 보여 준다
        .then(() => new Promise((resolve) => setTimeout(resolve, 500)))
        .finally(() => setRefreshing(false))
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [queryClient, refreshing, router])

  if (!pull && !refreshing) return null

  const ready = refreshing || pull >= TRIGGER / 2
  return (
    <div
      role="status"
      aria-label={refreshing ? '새로고침 중' : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-sticky flex justify-center"
      style={{ transform: `translateY(${refreshing ? TRIGGER / 2 : pull}px)` }}
    >
      <span className="mt-2 flex size-9 items-center justify-center rounded-full bg-base-white shadow-[0_0.25rem_0.75rem_rgb(0_0_0/0.12)]">
        <span
          className={cn(
            'size-5 rounded-full border-2 border-primary-500 border-t-transparent transition-opacity',
            refreshing ? 'animate-spin motion-reduce:animate-none' : '',
            ready ? 'opacity-100' : 'opacity-40',
          )}
          style={refreshing ? undefined : { rotate: `${pull * 4}deg` }}
        />
      </span>
    </div>
  )
}

export { AppPullToRefresh }
