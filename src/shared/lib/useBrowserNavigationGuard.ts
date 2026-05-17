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
  const hasChangesRef = useRef(false)
  const isGuardSeededRef = useRef(false)

  const checkHasChanges = useCallback(
    () => (typeof hasChanges === 'function' ? hasChanges() : hasChanges),
    [hasChanges],
  )

  useEffect(() => {
    hasChangesRef.current = checkHasChanges()
  }, [checkHasChanges])

  useEffect(() => {
    if (!enabled) return

    if (!isGuardSeededRef.current) {
      window.history.pushState(window.history.state, '', window.location.href)
      isGuardSeededRef.current = true
    }

    const handlePopState = (event: PopStateEvent) => {
      if (allowNavigationRef.current) return

      if (!hasChangesRef.current) {
        allowNavigationRef.current = true
        window.history.back()
        return
      }

      event.preventDefault()
      window.history.pushState(window.history.state, '', window.location.href)
      setShowBrowserGuard(true)
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasChangesRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled])

  const promptBrowserNavigation = useCallback(() => {
    if (!hasChangesRef.current) {
      allowNavigationRef.current = true
      window.history.back()
      return
    }

    setShowBrowserGuard(true)
  }, [])

  const handleBrowserConfirm = useCallback(() => {
    allowNavigationRef.current = true
    setShowBrowserGuard(false)
    // The first back press moves from the guard entry to the real page entry.
    // Confirming should skip both entries and return to the previous page.
    window.history.go(-2)
  }, [])

  const handleBrowserCancel = useCallback(() => {
    allowNavigationRef.current = false
    setShowBrowserGuard(false)
  }, [])

  return {
    promptBrowserNavigation,
    showBrowserGuard,
    handleBrowserConfirm,
    handleBrowserCancel,
  }
}

export { useBrowserNavigationGuard }
