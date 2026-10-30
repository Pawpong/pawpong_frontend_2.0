import { cn } from '@/shared/lib/cn'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  /** sticky top 처럼 런타임 계산값이 필요한 경우에만 사용 */
  style?: React.CSSProperties
}

/**
 * 가로 틀(페이지 폭 + 좌우 여백) — 상단바·푸터·하단 고정 바·띠 페이지처럼 PageFrame 밖에서
 * 같은 틀에 맞춰야 하는 줄만 쓴다. 일반 페이지 본문은 라우트 레이아웃의 PageFrame 이 이미 감싼다.
 * 값은 globals.css 의 page-shell 한 곳에서 정한다.
 */
const PageShell = ({ children, className, style }: PageShellProps) => (
  <div className={cn('page-shell', className)} style={style}>
    {children}
  </div>
)

export { PageShell }
