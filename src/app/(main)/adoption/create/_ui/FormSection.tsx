import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/Cn'

interface FormSectionProps {
  title: string
  required?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
}

const FormSection = ({
  title,
  required,
  icon,
  className,
  children,
}: FormSectionProps) => (
  <div
    className={cn(
      'flex flex-col gap-3 rounded-2xl bg-[#f5f5f5] p-3.5 tab:p-[1.875rem]',
      className,
    )}
  >
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-xl tab:font-semibold">
        {title}
      </span>
      <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-base tab:leading-[1.5]">
        {required ? '필수' : '선택'}
      </span>
      {icon}
    </div>
    {children}
  </div>
)

export { FormSection }
