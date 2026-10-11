import Link from 'next/link'
import type { ReactNode } from 'react'
import { PixelArrowRightIcon } from '@/shared/assets'
import { buttonVariants } from './Button'
import { TicketStrip, ticketStyles, type TicketAccent } from './Ticket'

interface TicketActionCardProps {
  /** 윗단 영문 라벨. 예: CARE MAP */
  label: string
  /** 윗단 오른쪽 아이콘. 장식이므로 aria-hidden 으로 넘긴다. */
  stripIcon?: ReactNode
  accent?: TicketAccent
  /** 제목 왼쪽 도트 그림. 크기·색은 그림마다 달라 호출부가 정한다. */
  icon: ReactNode
  eyebrow?: string
  title: string
  description?: string
  actions: readonly { label: string; href: string }[]
}

/**
 * 도트 그림 + 제목 + 이동 버튼(최대 두 개)을 담은 티켓 카드.
 * 돌봄 지도 입구와 새 기능 소개가 같이 쓴다. 노트북부터는 버튼을 제목 오른쪽에 둔다.
 */
export function TicketActionCard({
  label,
  stripIcon,
  accent = 'butter',
  icon,
  eyebrow,
  title,
  description,
  actions,
}: TicketActionCardProps) {
  return (
    <section aria-label={title} data-accent={accent} className={ticketStyles.ticket}>
      <TicketStrip label={label} icon={stripIcon} />
      <div className="grid gap-5 p-5 tab:px-7 tab:py-6 lap:grid-cols-[minmax(0,1fr)_minmax(17.5rem,22.5rem)] lap:items-center lap:gap-7">
        <div className="flex min-w-0 items-center gap-3.5 tab:gap-5">
          {icon}
          <div className="min-w-0 break-keep">
            {eyebrow && <p className="text-xs font-semibold text-primary-600">{eyebrow}</p>}
            <h2 className="mt-1 font-cafe24 text-xl leading-snug text-neutral-850 tab:text-2xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-sm leading-6 text-neutral-700">{description}</p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="grid min-w-0 grid-cols-2 gap-3">
            {/* 버튼 폭은 감싸는 칸이 정한다. 버튼이 하나면 칸이 줄을 채운다. */}
            {actions.map((action, index) => (
              <div
                key={`${action.href}-${index}`}
                className={actions.length === 1 ? 'col-span-full' : undefined}
              >
                <Link
                  href={action.href}
                  className={buttonVariants({
                    intent: index === 0 ? 'primary' : 'secondary',
                    width: 'full',
                  })}
                >
                  {action.label}
                  <PixelArrowRightIcon aria-hidden className="ml-1.5 size-3.5 shrink-0" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
