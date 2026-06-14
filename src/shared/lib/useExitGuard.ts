'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseExitGuardOptions {
  hasChanges: boolean | (() => boolean)
  enabled?: boolean
}

/**
 * 브라우저 뒤로가기/새로고침 + 프로그래밍 방식 나가기를 통합 관리하는 훅
 * - popstate/beforeunload: 브라우저 네비게이션 가드
 * - requestExit: 닫기 버튼 등 프로그래밍 방식 나가기 가드
 */
const useExitGuard = ({ hasChanges, enabled = true }: UseExitGuardOptions) => {
  const [showGuard, setShowGuard] = useState(false)
  const sourceRef = useRef<'browser' | 'programmatic' | null>(null)
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

  // 브라우저 뒤로가기/새로고침 가드
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
      sourceRef.current = 'browser'
      setShowGuard(true)
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

  /** 닫기 버튼 등에서 호출. 변경사항 있으면 가드 표시, 없으면 true 반환 */
  const requestExit = useCallback((): boolean => {
    if (!hasChangesRef.current) return true
    sourceRef.current = 'programmatic'
    setShowGuard(true)
    return false
  }, [])

  /** 사용자가 나가기 확인
   *  - browser: 가드용으로 쌓은 history 1칸 + 원래 1칸 = go(-2)로 복귀
   *  - programmatic(X 버튼 등): 라우터를 모르는 훅 대신 호출부가 넘긴 콜백으로 나감 */
  const confirmExit = useCallback((onProgrammaticExit?: () => void) => {
    setShowGuard(false)
    if (sourceRef.current === 'browser') {
      allowNavigationRef.current = true
      window.history.go(-2)
    } else if (sourceRef.current === 'programmatic') {
      onProgrammaticExit?.()
    }
    sourceRef.current = null
  }, [])

  /** 사용자가 나가기 취소 */
  const cancelExit = useCallback(() => {
    allowNavigationRef.current = false
    setShowGuard(false)
    sourceRef.current = null
  }, [])

  return {
    showGuard,
    requestExit,
    confirmExit,
    cancelExit,
  }
}

export { useExitGuard }
