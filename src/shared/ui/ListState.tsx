import type { ReactNode } from 'react'
import { AsyncState } from './AsyncState'
import { AppPublicEmptyMessage } from './AppPublicEmptyMessage'

interface ListStateProps {
  children: ReactNode
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  loadingText: ReactNode
  /** 로딩 중 글자 안내 대신 보여줄 자리 모양(스켈레톤). 안내 문구는 스켈레톤이 낭독용으로 함께 둔다. */
  loadingFallback?: ReactNode
  errorText: ReactNode
  emptyText: ReactNode
  emptyAction?: ReactNode
  /** 오류 상태에서 같은 자리에서 재시도할 수 있는 액션. */
  errorAction?: ReactNode
  onRetry?: () => void
  isRetrying?: boolean
  /** 작성자별 앱 공개 동의가 적용되는 공개 목록에만 사용한다. */
  appPublicContent?: boolean
}

/** 목록 데이터와 로딩·오류·빈 상태 사이의 공통 렌더링 분기. */
const ListState = ({
  children,
  isPending,
  isError,
  isEmpty,
  loadingText,
  loadingFallback,
  errorText,
  emptyText,
  emptyAction,
  errorAction,
  onRetry,
  isRetrying,
  appPublicContent = false,
}: ListStateProps) => {
  if (isPending) return loadingFallback ?? <AsyncState status="loading" message={loadingText} />
  if (isError && isEmpty)
    return (
      <AsyncState
        status="error"
        message={errorText}
        action={errorAction}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  if (isEmpty)
    return (
      <AsyncState
        status="empty"
        action={emptyAction}
        message={
          appPublicContent ? <AppPublicEmptyMessage>{emptyText}</AppPublicEmptyMessage> : emptyText
        }
      />
    )
  return children
}

export { ListState }
