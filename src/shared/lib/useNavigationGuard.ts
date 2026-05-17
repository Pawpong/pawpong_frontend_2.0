'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

interface UseNavigationGuardOptions {
  hasData: boolean | (() => boolean)
  onCancel?: () => void
}

const useNavigationGuard = ({ hasData, onCancel }: UseNavigationGuardOptions) => {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)

  const checkHasData = useCallback(
    () => (typeof hasData === 'function' ? hasData() : hasData),
    [hasData],
  )

  const guardNavigation = useCallback(
    (href: string) => {
      if (checkHasData()) {
        setShowDialog(true)
        setNextPath(href)
      } else {
        router.push(href)
      }
    },
    [checkHasData, router],
  )

  const confirmNavigation = useCallback(() => {
    if (nextPath) router.push(nextPath)
    setShowDialog(false)
    setNextPath(null)
  }, [nextPath, router])

  const cancelNavigation = useCallback(() => {
    setShowDialog(false)
    setNextPath(null)
    onCancel?.()
  }, [onCancel])

  return {
    showDialog,
    guardNavigation,
    confirmNavigation,
    cancelNavigation,
  }
}

export { useNavigationGuard }
