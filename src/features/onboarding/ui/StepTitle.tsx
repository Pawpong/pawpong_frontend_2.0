'use client'

import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'

interface StepTitleProps {
  children: React.ReactNode
  subtitle?: string
}

const StepTitle = ({ children, subtitle }: StepTitleProps) => (
  <div className="flex w-full flex-col items-center justify-center gap-[0.125rem] px-5 py-12 tab:px-20">
    <h1
      className={cn(
        cafe24Proup.className,
        'text-center font-cafe24 text-[1.25rem] font-bold leading-[1.5] text-[#3e3e3e] tab:text-[1.5rem]',
      )}
    >
      {children}
    </h1>
    {subtitle && (
      <p className="text-center text-[0.875rem] font-semibold leading-[1.5] text-[#6b6b6b] tab:text-[1.25rem]">
        {subtitle}
      </p>
    )}
  </div>
)

export { StepTitle }
