'use client'

import { useEffect } from 'react'
import { useNavigationGuard } from './useNavigationGuard'
import { useNavigationGuardContext } from './NavigationGuardContext'

interface UseFormGuardOptions {
  hasChanges: boolean | (() => boolean)
  onCancel?: () => void
}

const useFormGuard = ({ hasChanges, onCancel }: UseFormGuardOptions) => {
  const checkHasChanges = typeof hasChanges === 'function' ? hasChanges() : hasChanges

  const {
    showDialog: showNavigationDialog,
    guardNavigation,
    confirmNavigation: handleNavigationConfirm,
    cancelNavigation: handleNavigationCancel,
  } = useNavigationGuard({
    hasData: checkHasChanges,
    onCancel,
  })

  const { setGuardNavigation } = useNavigationGuardContext() || {}

  useEffect(() => {
    if (setGuardNavigation) {
      setGuardNavigation(guardNavigation)
    }
    return () => {
      if (setGuardNavigation) {
        setGuardNavigation(undefined)
      }
    }
  }, [guardNavigation, setGuardNavigation])

  return {
    showNavigationDialog,
    handleNavigationConfirm,
    handleNavigationCancel,
  }
}

export { useFormGuard }
