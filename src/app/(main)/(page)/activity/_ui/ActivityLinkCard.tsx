import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRightIcon } from '@/shared/assets'
import { TEXT } from '@/shared/config'

export const ActivityLinkCard = ({
  href,
  identity,
  children,
  meta,
  action,
}: {
  href: string
  identity: ReactNode
  children?: ReactNode
  meta: string
  action: string
}) => (
  <li>
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-150 bg-white p-5 focus-ring transition-colors hover:border-primary-200 hover:bg-primary-50/30 tab:p-6"
    >
      {identity}
      {children && (
        <div className="mt-4 min-w-0 [overflow-wrap:anywhere] break-words">{children}</div>
      )}
      {/* 아래 줄: 왼쪽 날짜 · 오른쪽 이동 안내. 위 여백을 카드 안쪽 여백과 같게 둬 줄이 위아래 가운데에 온다 */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-150 pt-5 tab:pt-6">
        <span className={TEXT.meta}>{meta}</span>
        <span className="flex shrink-0 items-center gap-0.5 text-primary-600">
          <span className="text-sm leading-[1.5] font-semibold tab:text-[0.9375rem]">{action}</span>
          <ArrowRightIcon className="size-5 shrink-0" aria-hidden="true" />
        </span>
      </div>
    </Link>
  </li>
)
