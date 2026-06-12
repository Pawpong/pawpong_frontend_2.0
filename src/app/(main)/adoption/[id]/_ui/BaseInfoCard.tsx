import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface BaseInfoCardProps {
  title: string
  className?: string
  children: ReactNode
}

const BaseInfoCard = ({ title, className, children }: BaseInfoCardProps) => (
  <div
    className={cn(
      'overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.875rem] pc:p-[1.25rem]',
      className,
    )}
  >
    <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] pc:text-[1.25rem] pc:font-semibold">
      {title}
    </p>
    <div className="mt-[1rem] pc:mt-[1.25rem]">{children}</div>
  </div>
)

export { BaseInfoCard }
