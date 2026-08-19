'use client'

import { useEffect, useState } from 'react'

const TOAST_DURATION_MS = 3000

// 토스트 표시 + 자동 닫힘 로직 분리 (SRP)
// 성공(default)·실패(error) 두 종류를 같은 슬롯에서 표시한다.
type ToastState = { message: string; status: 'default' | 'error' }

const useToast = (duration = TOAST_DURATION_MS) => {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), duration)
    return () => clearTimeout(timer)
  }, [toast, duration])

  return {
    current: toast,
    success: (message: string) => setToast({ message, status: 'default' }),
    error: (message: string) => setToast({ message, status: 'error' }),
    hide: () => setToast(null),
  }
}

export { useToast, TOAST_DURATION_MS, type ToastState }
