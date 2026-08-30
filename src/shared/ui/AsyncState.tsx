import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface AsyncStateProps {
  status: 'loading' | 'error' | 'empty'
  message: ReactNode
  action?: ReactNode
  className?: string
}

/**
 * 상세·목록 화면이 같은 높이와 타이포로 로딩/오류/빈 상태를 알리는 공통 상태 블록.
 * 오류는 빈 데이터일 때만 이 컴포넌트로 대체하고, 이전 데이터가 있으면 화면을 유지한다.
 */
const AsyncState = ({ status, message, action, className }: AsyncStateProps) => (
  <div
    role={status === 'error' ? 'alert' : 'status'}
    className={cn(
      'flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm font-medium text-neutral-700',
      className,
    )}
  >
    <p>{message}</p>
    {action}
  </div>
)

export { AsyncState }
