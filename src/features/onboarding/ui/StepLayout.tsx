import { cn } from '@/shared/lib/cn'

interface StepLayoutProps {
  children: React.ReactNode
  className?: string
}

const StepLayout = ({ children, className }: StepLayoutProps) => (
  <div className={cn('flex flex-col items-center pb-[7rem] tab:pb-0', className)}>{children}</div>
)

export { StepLayout }
