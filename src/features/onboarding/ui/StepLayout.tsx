import { cn } from '@/shared/lib/Cn'

interface StepLayoutProps {
  children: React.ReactNode
  className?: string
}

const StepLayout = ({ children, className }: StepLayoutProps) => (
  <div className={cn('flex flex-col items-center pb-[8rem] tab:pb-0', className)}>
    {children}
  </div>
)

export { StepLayout }
