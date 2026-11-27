'use client'

import { useSyncExternalStore } from 'react'
import { cn } from '@/shared/lib/cn'

interface ChatTimeProps {
  dateStr?: string
  className?: string
  /** 표기 방식 — 말풍선은 formatChatMessageTime, 목록은 formatChatListTime */
  format: (dateStr?: string) => string
}

const ChatTime = ({ dateStr, className, format }: ChatTimeProps) => {
  // 시각·날짜는 보는 사람의 시간대와 지금 시각에 따라 달라 서버 HTML 과 어긋날 수 있다.
  // 하이드레이션이 끝난 뒤에만 그린다.
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const label = isClient ? format(dateStr) : ''

  return (
    <span
      className={cn('shrink-0 text-xs leading-[1.5] font-medium text-neutral-700', className)}
      suppressHydrationWarning
    >
      {label}
    </span>
  )
}

export { ChatTime }
