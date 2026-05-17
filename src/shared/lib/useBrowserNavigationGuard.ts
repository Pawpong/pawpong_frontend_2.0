'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseBrowserNavigationGuardOptions {
  hasChanges: boolean | (() => boolean)
  enabled?: boolean
}

/**
 * 브라우저 뒤로가기/앞으로가기/새로고침 시 확인 모달을 띄우기 위한 가드 훅
 * - popstate: 커스텀 모달 가능
 * - beforeunload: 브라우저 기본 confirm만 가능
 */
const useBrowserNavigationGuard = ({
  hasChanges,
  enabled = false,
}: UseBrowserNavigationGuardOptions) => {
  const [showBrowserGuard, setShowBrowserGuard] = useState(false)
  const allowNavigationRef = useRef(false)

  const checkHasChanges = useCallback(
    () => (typeof hasChanges === 'function' ? hasChanges() : hasChanges),
    [hasChanges],
  )

  useEffect(() => {
    if (!enabled) return

    window.history.pushState(null, '', window.location.href)

    const handlePopState = (event: PopStateEvent) => {
      if (!checkHasChanges() || allowNavigationRef.current) return
      event.preventDefault()
      window.history.pushState(null, '', window.location.href)
      setShowBrowserGuard(true)
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!checkHasChanges()) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [checkHasChanges, enabled])

  const handleBrowserConfirm = () => {
    allowNavigationRef.current = true
    setShowBrowserGuard(false)
    window.history.back()
  }

  const handleBrowserCancel = () => {
    allowNavigationRef.current = false
    setShowBrowserGuard(false)
  }

  return {
    showBrowserGuard,
    handleBrowserConfirm,
    handleBrowserCancel,
  }
}

export { useBrowserNavigationGuard }
