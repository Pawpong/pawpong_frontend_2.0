import { cn } from '@/shared/lib/Cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn('mx-auto w-full px-[1rem] tab:px-[3rem] pc:px-[5rem]', className)}>
      {children}
    </div>
  )
}

export { Container }
