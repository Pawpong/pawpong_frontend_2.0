import type { ReactNode } from 'react'

interface ListStateProps {
  children: ReactNode
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  loadingText: ReactNode
  errorText: ReactNode
  emptyText: ReactNode
}

const StateMessage = ({
  children,
  isError = false,
}: {
  children: ReactNode
  isError?: boolean
}) => (
  <p role={isError ? 'alert' : 'status'} className="py-10 text-center text-sm text-neutral-700">
    {children}
  </p>
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
}: ListStateProps) => {
  if (isPending) return <StateMessage>{loadingText}</StateMessage>
  if (isError && isEmpty) return <StateMessage isError>{errorText}</StateMessage>
  if (isEmpty) return <StateMessage>{emptyText}</StateMessage>
  return children
}

export { ListState }
