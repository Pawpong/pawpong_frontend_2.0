'use client'

import { useEffect, useState } from 'react'
import { getPetCharacter } from '@/entities/playground-pet'
import { PetCharacterResource, validatePetSheet } from './characterResource'
import { inPetSession, type PetSession } from './usePetSession'

export function usePetCharacter(
  session: PetSession,
  petId: string,
  sourceJobId: string,
  enabled = true,
) {
  const [attempt, setAttempt] = useState(0)
  const identity = JSON.stringify([session.scope, petId, sourceJobId, attempt, enabled])
  const [state, setState] = useState<{
    identity: string
    url: string | null
    error: string | null
  }>({
    identity: '',
    url: null,
    error: null,
  })
  useEffect(() => {
    if (!enabled) return
    let alive = true
    const resource = new PetCharacterResource()
    void resource
      .load((signal) => inPetSession(session, () => getPetCharacter(signal)), validatePetSheet)
      .then((url) => {
        if (alive && url) setState({ identity, url, error: null })
      })
      .catch(() => {
        if (alive)
          setState({ identity, url: null, error: '우리 아이의 게임 캐릭터를 준비하지 못했어요.' })
      })
    return () => {
      alive = false
      resource.dispose()
    }
  }, [session, identity, enabled])
  return {
    ...(state.identity === identity ? state : { url: null, error: null }),
    retry: () => {
      setState({ identity, url: null, error: null })
      setAttempt((value) => value + 1)
    },
  }
}
