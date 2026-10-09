import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from './Button'

/** 빈 목록에서 다음 행동으로 잇는 버튼. 모든 빈 화면이 같은 크기·모양을 쓴다. */
export function EmptyStateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonVariants({ intent: 'secondary', size: 'md' })}>
      {children}
    </Link>
  )
}
