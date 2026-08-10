import type { ReactNode } from 'react'

interface ListStateMessageProps {
  children: ReactNode
  kind?: 'loading' | 'error' | 'empty'
}

/** 목록의 로딩·오류·빈 상태에 사용하는 공통 안내 문구. */
const ListStateMessage = ({ children, kind = 'empty' }: ListStateMessageProps) => (
  <p
    role={kind === 'error' ? 'alert' : 'status'}
    className="py-10 text-center text-sm text-neutral-700"
  >
    {children}
  </p>
)

export { ListStateMessage }
