import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'

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
// [refactored] EmptyState 와 동일하던 컨테이너를 제거하고 위임 (일러스트는 empty 에서만 노출)
const AsyncState = ({ status, message, action, className }: AsyncStateProps) => (
  <EmptyState
    role={status === 'error' ? 'alert' : 'status'}
    illustration={status === 'empty'}
    message={message}
    action={action}
    className={className}
  />
)

export { AsyncState }
