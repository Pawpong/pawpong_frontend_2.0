'use client'

import { useEffect, useState } from 'react'

export type ViewportPosition = 'inside' | 'above' | 'below'

/**
 * 요소가 화면 안에 있는지, 화면 위로 지나갔는지, 아직 아래에 있는지 추적한다.
 * 콜백 ref 라 요소가 바뀌거나 다시 나타나도 따라간다.
 * 관찰할 요소가 없거나 IntersectionObserver 가 없는 환경에서는 화면 안에 있다고 본다.
 */
export function useViewportPosition<T extends Element>() {
  const [node, setNode] = useState<T | null>(null)
  const [position, setPosition] = useState<ViewportPosition>('inside')
  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPosition('inside')
      else setPosition(entry.boundingClientRect.top < 0 ? 'above' : 'below')
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])
  return [setNode, node ? position : 'inside'] as const
}
