'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '../_lib/utils'

interface RelativeTimeProps {
  dateStr?: string
  className?: string
}

const RelativeTime = ({ dateStr, className }: RelativeTimeProps) => {
  // 상대 시간은 Date.now()에 의존하므로 SSR/하이드레이션 불일치를 막기 위해
  // 클라이언트 마운트 이후에만 계산한다.
  const [label, setLabel] = useState('')

  useEffect(() => {
    setLabel(formatRelativeTime(dateStr))
  }, [dateStr])

  return (
    <span
      className={cn('shrink-0 text-xs leading-[1.5] font-medium text-neutral-700', className)}
      suppressHydrationWarning
    >
      {label}
    </span>
  )
}

export { RelativeTime }
