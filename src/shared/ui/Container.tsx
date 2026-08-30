import { cn } from '@/shared/lib/cn'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        RESPONSIVE_SHELL_CLASS,
        'px-[1.25rem] tab:px-[3rem] pc:px-[5rem]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Container }
