'use client'

import type { ComponentType, ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { CloseIcon } from '@/shared/assets/icons'

const alertMessage = tv({
  slots: {
    base: 'flex items-center rounded-lg',
    group: 'flex min-w-0 flex-1',
    icon: 'shrink-0',
    message: 'min-w-0 flex-1 overflow-hidden text-ellipsis leading-[1.5] font-semibold',
    action: 'shrink-0 leading-[1.5] font-medium underline decoration-1 underline-offset-2',
    close: 'size-6 shrink-0',
  },
  variants: {
    status: {
      info: { base: 'bg-[#d3e2fd] text-[#256ef4]' },
      error: { base: 'bg-[#f7d8db] text-[#d63d4a]' },
      default: { base: 'bg-[#3e3e3e] text-[#f6f6f6]' },
    },
    size: {
      md: {
        base: 'gap-3 p-2',
        group: 'items-center',
        icon: 'size-6',
        message: 'text-sm whitespace-nowrap',
        action: 'text-sm',
      },
      sm: {
        base: 'gap-2 px-2 py-1',
        group: 'items-start gap-1',
        icon: 'size-5',
        message: 'text-xs',
        action: 'text-xs',
      },
      // 모바일 sm → 태블릿 이상 md (CSS 브레이크포인트로 전환)
      responsive: {
        base: 'gap-2 px-2 py-1 tab:gap-3 tab:p-2',
        group: 'items-start gap-1 tab:items-center tab:gap-0',
        icon: 'size-5 tab:size-6',
        message: 'text-xs tab:text-sm tab:whitespace-nowrap',
        action: 'text-xs tab:text-sm',
      },
    },
  },
  defaultVariants: { status: 'info', size: 'md' },
})

interface AlertMessageProps {
  status?: 'info' | 'error' | 'default'
  size?: 'sm' | 'md' | 'responsive'
  message: ReactNode
  /** 선행 아이콘 컴포넌트 (색은 status에 따라 currentColor로 상속) */
  icon?: ComponentType<{ className?: string }>
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
  className?: string
}

const AlertMessage = ({
  status,
  size,
  message,
  icon: Icon,
  actionLabel,
  onAction,
  onClose,
  className,
}: AlertMessageProps) => {
  const styles = alertMessage({ status, size })

  return (
    <div className={cn(styles.base(), className)}>
      <div className={styles.group()}>
        {Icon && <Icon className={styles.icon()} />}
        <p className={styles.message()}>{message}</p>
      </div>

      {actionLabel && (
        <button type="button" onClick={onAction} className={styles.action()}>
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
          <CloseIcon className={styles.close()} />
        </button>
      )}
    </div>
  )
}

export { AlertMessage }
