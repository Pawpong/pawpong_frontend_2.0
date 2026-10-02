'use client'

import { useEffect, useRef } from 'react'

interface InfiniteScrollTriggerProps {
  onIntersect: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  rootMargin?: string
}

const InfiniteScrollTrigger = ({
  onIntersect,
  hasNextPage,
  isFetchingNextPage,
  rootMargin = '200px',
}: InfiniteScrollTriggerProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect()
      },
      { rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onIntersect, rootMargin])

  if (!hasNextPage) return null

  // 높이가 0이면 overflow-hidden 목록의 끝에서 교차 영역이 사라져 다음 페이지가 멈출 수 있다.
  return <div ref={ref} className="h-px" aria-hidden="true" />
}

export { InfiniteScrollTrigger }
