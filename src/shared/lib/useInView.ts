'use client'

import { useEffect, useState } from 'react'

/**
 * 요소가 화면 안에 보이는지 추적한다. 콜백 ref 라 요소가 바뀌거나 다시 나타나도 따라간다.
 * 관찰할 요소가 없거나 IntersectionObserver 가 없는 환경에서는 보인다고 본다.
 */
export function useInView<T extends Element>() {
  const [node, setNode] = useState<T | null>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])
  return [setNode, node ? inView : true] as const
}
