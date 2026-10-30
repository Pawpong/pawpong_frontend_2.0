import { cn } from '@/shared/lib/cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  /** sticky top 처럼 런타임 계산값이 필요한 경우에만 사용 */
  style?: React.CSSProperties
}

// 페이지 틀(폭·좌우 여백)은 globals.css 의 page-shell 한 곳에서 정한다. 여백을 바꾸려면 px 대신 [--page-gutter:…].
const Container = ({ children, className, style }: ContainerProps) => {
  return (
    <div className={cn('page-shell', className)} style={style}>
      {children}
    </div>
  )
}

export { Container }
