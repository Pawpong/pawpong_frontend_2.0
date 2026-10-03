'use client'

import { useEffect, useState } from 'react'

/** 표시용 시계만 진행한다. 브라우저 벽시계 변경으로 돌봄을 허용하거나 보상하지 않는다. */
export function useServerClock(serverTime: string) {
  const [clock, setClock] = useState({ stamp: serverTime, now: Date.parse(serverTime) })
  if (clock.stamp !== serverTime) setClock({ stamp: serverTime, now: Date.parse(serverTime) })
  useEffect(() => {
    const receivedAt = performance.now()
    const serverAt = Date.parse(serverTime)
    const timer = window.setInterval(() => {
      setClock({ stamp: serverTime, now: serverAt + Math.max(0, performance.now() - receivedAt) })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [serverTime])
  return clock.now
}

export function petRequestKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}
