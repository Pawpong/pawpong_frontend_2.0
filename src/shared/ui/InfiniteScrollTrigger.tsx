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

  return <div ref={ref} aria-hidden="true" />
}

export { InfiniteScrollTrigger }
