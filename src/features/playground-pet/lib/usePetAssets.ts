'use client'

import { useEffect, useState } from 'react'
import { loadPetAssets, type PetAssetManifest } from './gameAssets'

export function usePetAssets() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ manifest: PetAssetManifest | null; error: string | null }>({
    manifest: null,
    error: null,
  })
  useEffect(() => {
    const controller = new AbortController()
    void loadPetAssets(controller.signal)
      .then((manifest) => {
        if (!controller.signal.aborted) setState({ manifest, error: null })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ manifest: null, error: '방 그림을 불러오지 못했어요.' })
      })
    return () => controller.abort()
  }, [attempt])
  return {
    ...state,
    retry: () => {
      setState({ manifest: null, error: null })
      setAttempt((value) => value + 1)
    },
  }
}
