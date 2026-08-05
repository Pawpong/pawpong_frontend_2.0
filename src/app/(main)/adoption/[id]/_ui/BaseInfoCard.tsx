import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface BaseInfoCardProps {
  title: string
  className?: string
  children: ReactNode
}

const BaseInfoCard = ({ title, className, children }: BaseInfoCardProps) => (
  <div
    className={cn('overflow-hidden rounded-xl bg-point-50 p-[0.75rem] pc:p-5', className)}
  >
    <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] pc:text-[1.25rem] pc:leading-[1.5] pc:font-semibold pc:text-neutral-850">
      {title}
    </p>
    <div className="mt-[0.75rem] pc:mt-[1.25rem]">{children}</div>
  </div>
)

export { BaseInfoCard }
