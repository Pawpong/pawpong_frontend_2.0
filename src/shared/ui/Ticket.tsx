import Link from 'next/link'
import type { ReactNode } from 'react'
import { PixelArrowRightIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import styles from './Ticket.module.css'

export type TicketAccent = 'butter' | 'blue' | 'green' | 'peach'

/** 티켓 틀 클래스. 링크가 아닌 카드(놀이 결과 등)는 이 틀과 TicketStrip 을 직접 조합한다. */
export const ticketStyles = styles

/** 티켓 윗단: 영문 라벨과 작은 도트 아이콘. */
export function TicketStrip({ label, icon }: { label: ReactNode; icon?: ReactNode }) {
  return (
    <span className={styles.strip}>
      <span>{label}</span>
      {icon}
    </span>
  )
}

interface TicketLinkProps {
  href: string
  /** 윗단 영문 라벨. 예: PLAY CARD */
  label: string
  /** 윗단 오른쪽 아이콘. 장식이므로 aria-hidden 으로 넘긴다. */
  icon?: ReactNode
  accent?: TicketAccent
  eyebrow?: string
  title: string
  body?: ReactNode
  cta: string
  /** md 는 놀이 카드처럼 크게, sm 은 돌봄 도구처럼 촘촘하게. */
  size?: 'md' | 'sm'
  /** 마우스를 올리면 살짝 떠오른다. 놀이처럼 즐기는 카드에만 쓴다. */
  lift?: boolean
  className?: string
}

/**
 * 놀이터 PLAY CARD 와 같은 모양의 링크 카드.
 * 윗단 라벨 → (작은 머리말) → 제목 → 설명 → 픽셀 화살표 이어가기 순서를 모든 화면이 같이 쓴다.
 */
export function TicketLink({
  href,
  label,
  icon,
  accent = 'butter',
  eyebrow,
  title,
  body,
  cta,
  size = 'md',
  lift = false,
  className,
}: TicketLinkProps) {
  const md = size === 'md'
  return (
    <Link
      href={href}
      data-accent={accent}
      className={cn(
        styles.ticket,
        'flex h-full flex-col focus-ring',
        lift &&
          'transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <TicketStrip label={label} icon={icon} />
      <span className={cn('flex flex-1 flex-col', md ? 'p-5 tab:p-6' : 'p-4 tab:p-5')}>
        {eyebrow && <span className="text-xs font-semibold text-primary-600">{eyebrow}</span>}
        <span
          className={
            md
              ? 'mt-1 font-cafe24 text-xl break-keep text-neutral-850 tab:text-2xl'
              : 'text-base font-semibold break-keep text-neutral-850'
          }
        >
          {title}
        </span>
        {body && (
          <span
            className={cn(
              'break-keep text-neutral-700',
              md ? 'mt-2 text-sm leading-6' : 'mt-1.5 text-xs leading-5',
            )}
          >
            {body}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600',
            md ? 'mt-4' : 'mt-auto pt-3',
          )}
        >
          {cta}
          <PixelArrowRightIcon aria-hidden className="size-3" />
        </span>
      </span>
    </Link>
  )
}
