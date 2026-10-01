'use client'

import { useEffect, useRef, useState } from 'react'
import { classifyPetContent, type PetClassification } from '@/entities/ai-image'
import { categoryThumbnail } from './categoryThumbnail'

interface SuggestionState {
  text: string
  photo?: File
  phase: 'loading' | 'done' | 'error'
  result?: PetClassification
}

/** 입력 변경·직접 선택·화면 이탈 후 도착한 추천은 적용하지 않는다. */
export function usePetCategorySuggestion(text: string, photo?: File) {
  const [state, setState] = useState<SuggestionState | null>(null)
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [text, photo])

  const dismiss = () => {
    active.current?.abort()
    active.current = null
    setState(null)
  }

  const request = async () => {
    if ((!text.trim() && !photo) || (active.current && !active.current.signal.aborted)) return
    const controller = new AbortController()
    active.current = controller
    const snapshot = { text, photo }
    setState({ ...snapshot, phase: 'loading' })
    try {
      const thumbnail = photo ? await categoryThumbnail(photo) : undefined
      if (controller.signal.aborted) return
      const result = await classifyPetContent(text, thumbnail, controller.signal)
      if (!controller.signal.aborted) setState({ ...snapshot, phase: 'done', result })
    } catch {
      if (!controller.signal.aborted) setState({ ...snapshot, phase: 'error' })
    } finally {
      if (active.current === controller) active.current = null
    }
  }

  // effect의 취소가 실행되기 전 렌더에서도 이전 입력의 추천은 표시하지 않는다.
  const current = state?.text === text && state?.photo === photo ? state : null
  return { state: current, request, dismiss }
}
