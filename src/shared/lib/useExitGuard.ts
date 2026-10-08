'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseExitGuardOptions {
  hasChanges: boolean | (() => boolean)
  enabled?: boolean
  /** 닫기/취소 버튼(requestExit) 클릭 시 변경 여부와 무관하게 항상 확인 모달을 띄운다 */
  confirmAlways?: boolean
}

/**
 * 브라우저 뒤로가기/새로고침 + 프로그래밍 방식 나가기를 통합 관리하는 훅
 * - popstate/beforeunload: 브라우저 네비게이션 가드
 * - requestExit: 닫기 버튼 등 프로그래밍 방식 나가기 가드
 */
const useExitGuard = ({
  hasChanges,
  enabled = true,
  confirmAlways = false,
}: UseExitGuardOptions) => {
  const [showGuard, setShowGuard] = useState(false)
  const sourceRef = useRef<'browser' | 'programmatic' | null>(null)
  const allowNavigationRef = useRef(false)
  const hasChangesRef = useRef(false)
  const isGuardSeededRef = useRef(false)
  const finishNavigationRef = useRef<(() => void) | null>(null)

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
    const guardedHref = window.location.href

    if (!isGuardSeededRef.current) {
      window.history.pushState(window.history.state, '', window.location.href)
      isGuardSeededRef.current = true
    }

    const handleCompletedExit = (event: PopStateEvent) => {
      const finish = finishNavigationRef.current
      if (!finish) return
      finishNavigationRef.current = null
      isGuardSeededRef.current = false
      // 연속 뒤로가기로 다른 화면에 도달했다면 사용자의 이동을 덮어쓰지 않는다.
      if (window.location.href !== guardedHref) return
      // 가드가 만든 같은 URL 기록만 제거한다. Next가 작성 화면을 다시 복원하지 않게 한다.
      event.stopImmediatePropagation()
      finish()
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
      if (allowNavigationRef.current || !hasChangesRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('popstate', handleCompletedExit, true)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('popstate', handleCompletedExit, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      finishNavigationRef.current = null
    }
  }, [enabled])

  /** 닫기 버튼 등에서 호출. 변경사항 있으면(또는 confirmAlways면) 가드 표시, 아니면 true 반환 */
  const requestExit = useCallback((): boolean => {
    if (!confirmAlways && !hasChangesRef.current) return true
    sourceRef.current = 'programmatic'
    setShowGuard(true)
    return false
  }, [confirmAlways])

  /** 사용자가 나가기 확인
   *  - browser: 가드용으로 쌓은 history 1칸 + 원래 1칸 = go(-2)로 복귀
   *  - programmatic(X 버튼 등): 라우터를 모르는 훅 대신 호출부가 넘긴 콜백으로 나감 */
  const confirmExit = useCallback((onProgrammaticExit?: () => void) => {
    setShowGuard(false)
    if (sourceRef.current === 'browser') {
      allowNavigationRef.current = true
      window.history.go(-2)
    } else if (sourceRef.current === 'programmatic') {
      // onProgrammaticExit가 유발하는 popstate(예: history 뒤로가기)에 가드가 다시 걸리지 않도록 허용
      allowNavigationRef.current = true
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

  /** 저장/확인 후 이동할 때 가드용 기록을 먼저 걷어내 중복 작성 화면으로 돌아가지 않는다. */
  const completeExit = useCallback((navigate: () => void) => {
    if (finishNavigationRef.current) return
    allowNavigationRef.current = true
    sourceRef.current = null
    setShowGuard(false)
    if (isGuardSeededRef.current) {
      finishNavigationRef.current = navigate
      window.history.back()
    } else navigate()
  }, [])

  return {
    showGuard,
    requestExit,
    confirmExit,
    cancelExit,
    completeExit,
  }
}

export { useExitGuard }
