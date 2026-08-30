import type { ReactNode } from 'react'

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

const StateMessage = ({
  children,
  isError = false,
  action,
}: {
  children: ReactNode
  isError?: boolean
  action?: ReactNode
}) => (
  <div
    role={isError ? 'alert' : 'status'}
    className="flex flex-col items-center gap-3 py-10 text-center text-sm text-neutral-700"
  >
    <p>{children}</p>
    {action}
  </div>
)

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
  if (isPending) return <StateMessage>{loadingText}</StateMessage>
  if (isError && isEmpty)
    return (
      <StateMessage isError action={errorAction}>
        {errorText}
      </StateMessage>
    )
  if (isEmpty) return <StateMessage>{emptyText}</StateMessage>
  return children
}

export { ListState }
