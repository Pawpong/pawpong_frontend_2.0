'use client'

import { useSyncExternalStore } from 'react'

const getGnb = () => {
  const gnb = document.querySelector('[data-gnb], header')
  return gnb instanceof HTMLElement ? gnb : null
}

const subscribe = (onStoreChange: () => void) => {
  const gnb = getGnb()
  if (!gnb) return () => undefined

  const observer = new ResizeObserver(() => onStoreChange())
  observer.observe(gnb)
  return () => observer.disconnect()
}

const getSnapshot = () => getGnb()?.offsetHeight ?? 0

/** GNB(header) 높이 런타임 측정 — sticky 헤더 top 오프셋용 */
export const useGnbHeight = () => useSyncExternalStore(subscribe, getSnapshot, () => 0)
