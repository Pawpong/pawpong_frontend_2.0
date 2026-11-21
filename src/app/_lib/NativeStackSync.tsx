'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useBreederFavoriteStackSync } from '@/features/adopter'
import { useAdoptionFavoriteStackSync } from '@/features/adoption'
import { postNativeMessage, subscribeNativeMessage } from '@/shared/lib/nativeBridge'
import {
  STACK_MESSAGE,
  STACK_SHELL_PATH,
  getHistoryIndex,
  hasNativeStack,
  installHistoryIndex,
  isDetailLayer,
  isStackHref,
  isStackPath,
} from '@/shared/lib/nativeStack'

/**
 * 앱이 상세 WebView 를 미리 띄워 두고 밀어 올릴 때(UA PawpongStack/) 웹 쪽 연결. 화면에는 아무것도 그리지 않는다.
 * - 루트: 상세 링크 클릭을 가로채 OPEN_SCREEN 을 보낸다. 이 문서는 이동하지 않아 목록이 그대로 남는다.
 * - 상세: 대기 화면에서 STACK_NAVIGATE 를 받아 SPA 로 이동하고, 화면이 바뀔 때마다 처음 연 화면인지 알린다.
 * - 둘 다: 다른 WebView 에서 바뀐 즐겨찾기를 이 화면 캐시에 반영한다.
 */
const NativeStackSync = () => {
  useBreederFavoriteStackSync()
  useAdoptionFavoriteStackSync()
  const router = useRouter()
  const pathname = usePathname()
  // 상세를 연 순간의 히스토리 위치. 여기까지 돌아오면 앱이 화면을 닫는다
  const baseIndex = useRef<number | null>(null)

  useEffect(() => {
    if (!hasNativeStack() || isDetailLayer()) return
    // document 캡처 단계 — React 루트(Next Link)보다 먼저 받아 클라이언트 이동을 막는다
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement) || (anchor.target && anchor.target !== '_self'))
        return
      const url = new URL(anchor.href)
      if (!isStackHref(url)) return
      event.preventDefault()
      event.stopPropagation()
      postNativeMessage({ type: STACK_MESSAGE.OPEN_SCREEN, href: url.pathname + url.search })
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  useEffect(() => {
    if (!hasNativeStack() || !isDetailLayer()) return
    installHistoryIndex()
    const stopNavigate = subscribeNativeMessage(STACK_MESSAGE.STACK_NAVIGATE, ({ href }) => {
      if (typeof href !== 'string' || !isStackPath(href)) return
      // 대기 화면을 바꿔 끼운다 — 위치는 그대로라 여기가 '처음 연 화면'이 된다
      baseIndex.current = getHistoryIndex()
      router.replace(href, { scroll: true })
    })
    const stopReset = subscribeNativeMessage(STACK_MESSAGE.STACK_RESET, () => {
      baseIndex.current = null
      router.replace(STACK_SHELL_PATH)
    })
    postNativeMessage({ type: STACK_MESSAGE.STACK_READY })
    return () => {
      stopNavigate()
      stopReset()
    }
  }, [router])

  useEffect(() => {
    if (!hasNativeStack() || !isDetailLayer()) return
    postNativeMessage({
      type: STACK_MESSAGE.STACK_ROUTE,
      url: pathname + window.location.search,
      atBase: baseIndex.current !== null && getHistoryIndex() === baseIndex.current,
    })
  }, [pathname])

  return null
}

export { NativeStackSync }
