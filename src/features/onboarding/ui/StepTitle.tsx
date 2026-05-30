'use client'

import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'

interface StepTitleProps {
  children: React.ReactNode
  subtitle?: string
}

const StepTitle = ({ children, subtitle }: StepTitleProps) => (
  <div className="mt-[4.375rem] flex w-full flex-col items-center justify-center px-5 py-[3rem] tab:mt-0 tab:px-20">
    <h1
      className={cn(
        cafe24Proup.className,
        'text-center font-cafe24 text-[1.25rem] leading-[1.5] font-bold text-[#3e3e3e] tab:text-[1.5rem]',
      )}
    >
      {children}
    </h1>
    {subtitle && (
      <p className="mt-1 text-center text-[0.875rem] font-semibold leading-[1.5] text-[#6b6b6b] tab:text-[1.25rem]">
        {subtitle}
      </p>
    )}
  </div>
)

export { StepTitle }
