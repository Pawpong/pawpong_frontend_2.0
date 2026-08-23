import type { ComponentType, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { AlertCircleIcon, CheckRoundedIcon } from '@/shared/assets'

const helpMessage = tv({
  slots: {
    // 색은 base(container)에 지정 → 아이콘(currentColor)과 텍스트가 함께 상속
    base: 'flex items-center',
    icon: 'size-6 shrink-0',
    text: 'text-sm font-medium leading-[1.5]',
  },
  variants: {
    status: {
      default: { base: 'text-neutral-850' },
      info: { base: 'text-info-500' },
      error: { base: 'text-error-500' },
      success: { base: 'text-success-500' },
    },
  },
  defaultVariants: { status: 'default' },
})

type HelpMessageStatus = NonNullable<VariantProps<typeof helpMessage>['status']>

// [refactored] 안내문 상태(문구+상태+아이콘) 공통 타입 — 각 폼에서 인라인으로 반복하던 정의 통합
interface HelpMessageState {
  text: string
  status: HelpMessageStatus
  icon?: ComponentType<{ className?: string }>
}

// 피그마 기본 아이콘 (4개 상태 공통, 색만 상속). icon prop으로 언제든 교체 가능

interface HelpMessageProps {
  status?: HelpMessageStatus
  children: ReactNode
  /** 선행 아이콘 교체 (색은 status에 따라 currentColor로 상속). 미지정 시 status별 기본 아이콘 */
  icon?: ComponentType<{ className?: string }>
  /** 아이콘 숨김 */
  hideIcon?: boolean
  className?: string
}

// status별 기본 아이콘 — 성공은 체크, 나머지는 알림 (icon prop으로 언제든 교체)
const STATUS_ICON: Record<HelpMessageStatus, ComponentType<{ className?: string }>> = {
  default: AlertCircleIcon,
  info: AlertCircleIcon,
  error: AlertCircleIcon,
  success: CheckRoundedIcon,
}

const HelpMessage = ({
  status = 'default',
  children,
  icon,
  hideIcon,
  className,
}: HelpMessageProps) => {
  const styles = helpMessage({ status })
  const Icon = icon ?? STATUS_ICON[status]

  return (
    <div className={cn(styles.base(), className)}>
      {!hideIcon && <Icon className={styles.icon()} />}
      <p className={styles.text()}>{children}</p>
    </div>
  )
}

export { HelpMessage, type HelpMessageProps, type HelpMessageStatus, type HelpMessageState }
