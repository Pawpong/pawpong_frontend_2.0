import { TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

interface StepTitleProps {
  children: React.ReactNode
  subtitle?: string
  /** 세로 여백 조정 — 블록 간격을 부모가 잡는 화면에서 자체 py 를 끈다 */
  className?: string
}

/**
 * 스텝 제목 — 화면에서 유일한 디스플레이.
 * 이전에는 14px(tab 20)이라 그 안의 필드 라벨(16px)보다 작았고, 부제목도 같은 크기라
 * 굵기 말고는 위계 신호가 없었다. 제목은 display, 부제목은 보조 설명(prose)으로 나눈다.
 */
const StepTitle = ({ children, subtitle, className }: StepTitleProps) => (
  <div className={cn('flex w-full flex-col items-start gap-3 py-8 text-left tab:py-10', className)}>
    <h1 className={cn(TEXT.display, 'break-keep')}>{children}</h1>
    {subtitle && <p className={cn(TEXT.prose, 'break-keep')}>{subtitle}</p>}
  </div>
)

export { StepTitle }
