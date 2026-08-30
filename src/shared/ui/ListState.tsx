import type { ReactNode } from 'react'
import { AsyncState } from './AsyncState'

interface ListStateProps {
  children: ReactNode
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  loadingText: ReactNode
  errorText: ReactNode
  emptyText: ReactNode
  /** 오류 상태에서 같은 자리에서 재시도할 수 있는 액션. */
  errorAction?: ReactNode
}

/** 목록 데이터와 로딩·오류·빈 상태 사이의 공통 렌더링 분기. */
const ListState = ({
  children,
  isPending,
  isError,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  errorAction,
}: ListStateProps) => {
  if (isPending) return <AsyncState status="loading" message={loadingText} />
  if (isError && isEmpty)
    return <AsyncState status="error" message={errorText} action={errorAction} />
  if (isEmpty) return <AsyncState status="empty" message={emptyText} />
  return children
}

export { ListState }
