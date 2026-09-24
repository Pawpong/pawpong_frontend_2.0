import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRightIcon } from '@/shared/assets'
import { TEXT } from '@/shared/config'

export const ActivityLinkCard = ({
  href,
  identity,
  children,
  action,
}: {
  href: string
  identity: ReactNode
  children: ReactNode
  action: string
}) => (
  <li>
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-150 bg-white p-5 transition-colors hover:border-primary-200 hover:bg-primary-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:p-6"
    >
      {identity}
      <div className="mt-4 min-w-0 [overflow-wrap:anywhere] break-words">{children}</div>
      <div className="mt-4 flex min-h-10 items-center justify-end gap-1 border-t border-neutral-150 pt-3 text-primary-500">
        <span className={`${TEXT.sub} text-primary-500`}>{action}</span>
        <ArrowRightIcon className="size-5 shrink-0" aria-hidden="true" />
      </div>
    </Link>
  </li>
)
