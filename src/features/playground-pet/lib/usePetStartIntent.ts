'use client'

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { PetStartIntent, type PetStartContext } from './petStartIntent'

const serverSnapshot = () => null

export function usePetStartIntent(
  { selected, disabled, revision, activeId }: PetStartContext,
  onCancelPreparation?: () => void,
) {
  const [intent] = useState(() => new PetStartIntent())
  useLayoutEffect(() => {
    intent.activate()
    return () => intent.dispose()
  }, [intent])
  useLayoutEffect(() => {
    if (intent.update({ selected, disabled, revision, activeId })) onCancelPreparation?.()
  }, [intent, selected, disabled, revision, activeId, onCancelPreparation])
  const status = useSyncExternalStore(intent.subscribe, intent.snapshot, serverSnapshot)
  return {
    intent,
    phase: status === 'preparing' || status === 'sending' ? status : null,
    cancelled: status === 'cancelled',
    cancelPreparation: () => {
      if (intent.cancelPreparation()) onCancelPreparation?.()
    },
  }
}
