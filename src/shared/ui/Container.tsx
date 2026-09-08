import { cn } from '@/shared/lib/cn'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  /** sticky top 처럼 런타임 계산값이 필요한 경우에만 사용 */
  style?: React.CSSProperties
}

const Container = ({ children, className, style }: ContainerProps) => {
  return (
    <div
      className={cn(RESPONSIVE_SHELL_CLASS, 'px-[1.25rem] tab:px-[3rem] pc:px-[5rem]', className)}
      style={style}
    >
      {children}
    </div>
  )
}

export { Container }
