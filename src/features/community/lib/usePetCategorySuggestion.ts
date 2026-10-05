'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { classifyPetContent, type PetClassification } from '@/entities/ai-image'
import { categoryThumbnail } from './categoryThumbnail'

interface SuggestionState {
  text: string
  photo?: File
  phase: 'waiting' | 'loading' | 'done' | 'error'
  result?: PetClassification
}

const DEBOUNCE_MS = 1200
// 서버의 사용자당 분당 6회 제한 안에서 입력이 멈춘 최신 내용만 보낸다.
const MIN_REQUEST_INTERVAL_MS = 11000
let lastRequestAt = -Infinity

/** 입력 변경·직접 선택·화면 이탈 뒤에는 늦게 도착한 분류 결과를 적용하지 않는다. */
export function usePetCategorySuggestion(text: string, photo?: File, automatic = true) {
  const input = text.trim().slice(0, 2000)
  const [state, setState] = useState<SuggestionState | null>(null)
  const [attempt, setAttempt] = useState(0)
  const active = useRef<AbortController | null>(null)
  const dismiss = useCallback(() => {
    active.current?.abort()
    active.current = null
    setState(null)
  }, [])

  useEffect(() => {
    if (!automatic || (!input && !photo)) return
    const controller = new AbortController()
    active.current = controller
    const snapshot = { text: input, photo }
    const request = async () => {
      if (controller.signal.aborted) return
      setState({ ...snapshot, phase: 'loading' })
      try {
        const thumbnail = photo ? await categoryThumbnail(photo) : undefined
        if (controller.signal.aborted) return
        lastRequestAt = Date.now()
        const result = await classifyPetContent(input, thumbnail, controller.signal)
        if (!controller.signal.aborted) setState({ ...snapshot, phase: 'done', result })
      } catch {
        if (!controller.signal.aborted) setState({ ...snapshot, phase: 'error' })
      }
    }
    const delay = Math.max(DEBOUNCE_MS, lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now())
    const timer = setTimeout(() => void request(), delay)
    return () => {
      clearTimeout(timer)
      controller.abort()
      if (active.current === controller) active.current = null
    }
  }, [input, photo, automatic, attempt])

  const retry = () => {
    dismiss()
    setAttempt((count) => count + 1)
  }
  // effect가 취소되기 전 렌더에서도 이전 사진/글의 결과를 표시하지 않는다.
  const current = automatic && state?.text === input && state?.photo === photo ? state : null
  const waiting: SuggestionState | null =
    automatic && (input || photo) ? { text: input, photo, phase: 'waiting' } : null
  return { state: current ?? waiting, retry, dismiss }
}
