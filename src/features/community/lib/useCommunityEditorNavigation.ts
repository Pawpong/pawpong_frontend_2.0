'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { sameWindowLinkHref } from '@/shared/lib/sameWindowLink'

export function useCommunityEditorNavigation(hasChanges: boolean, exitHref: string) {
  const router = useRouter()
  const pendingHref = useRef<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const { showGuard, requestExit, confirmExit, cancelExit, completeExit } = useExitGuard({
    hasChanges,
  })
  const leave = useCallback(
    (href: string) => {
      setIsLeaving(true)
      completeExit(() => {
        if (href.startsWith('/')) router.replace(href)
        else window.location.assign(href)
      })
    },
    [completeExit, router],
  )
  const requestNavigation = useCallback(
    (href: string) => {
      pendingHref.current = href
      if (requestExit()) leave(href)
    },
    [leave, requestExit],
  )

  useEffect(() => {
    // 전역 메뉴와 본문 링크를 동일하게 보호하되 다른 작성 폼에는 적용하지 않는다.
    const onClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement)) return
      const href = sameWindowLinkHref(event, anchor, window.location.href)
      if (!href) return
      event.preventDefault()
      event.stopPropagation()
      requestNavigation(href)
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [requestNavigation])

  const cancel = () => {
    pendingHref.current = null
    cancelExit()
  }
  const discard = () => confirmExit(() => leave(pendingHref.current ?? exitHref))
  const saved = (href: string) => {
    if (!showGuard) leave(href)
    else discard()
  }
  return {
    isLeaving,
    showGuard,
    cancel,
    discard,
    saved,
    close: () => requestNavigation(exitHref),
  }
}
