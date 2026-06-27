'use client'

import { useLayoutEffect, useState } from 'react'

/** GNB(header) 높이 런타임 측정 — sticky 헤더 top 오프셋용 */
export const useGnbHeight = () => {
  const [gnbH, setGnbH] = useState(0)

  useLayoutEffect(() => {
    const gnb = document.querySelector('[data-gnb], header')
    if (!(gnb instanceof HTMLElement)) {
      setGnbH(0)
      return
    }

    const measure = () => {
      setGnbH(gnb instanceof HTMLElement ? gnb.offsetHeight : 0)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(gnb)

    return () => observer.disconnect()
  }, [])

  return gnbH
}
