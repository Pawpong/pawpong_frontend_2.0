import { cn } from '@/shared/lib/Cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn('mx-auto w-full max-w-[90rem] px-[1.25rem] tab:px-[3rem] pc:px-[5rem]', className)}>
      {children}
    </div>
  )
}

export { Container }
