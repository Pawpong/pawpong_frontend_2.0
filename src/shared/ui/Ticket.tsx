import Link from 'next/link'
import type { ReactNode } from 'react'
import { PixelArrowRightIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

export type TicketAccent = 'butter' | 'blue' | 'green' | 'peach'

// 띠 색 변수(--accent·--accent-edge·--accent-ink). 기본은 버터, data-accent 로 바꾼다.
// 띠 위 작은 글자(--accent-ink)는 띠 색 위에서 4.5:1 이상이 되도록 테두리보다 한 단계 진하게 쓴다.
const ACCENT =
  '[--accent:#fff3b8] [--accent-edge:#ad651d] [--accent-ink:var(--color-primary-600,#94591f)] ' +
  'data-[accent=green]:[--accent:#cfe6c3] data-[accent=green]:[--accent-edge:#55784d] data-[accent=green]:[--accent-ink:#4a6943] ' +
  'data-[accent=peach]:[--accent:#ffd9c2] data-[accent=peach]:[--accent-edge:#b86a3c] data-[accent=peach]:[--accent-ink:#8f522e] ' +
  'data-[accent=blue]:[--accent:#d6e4fb] data-[accent=blue]:[--accent-edge:#4f6f9f] data-[accent=blue]:[--accent-ink:#476590]'

/**
 * 놀이터 PLAY CARD 에서 시작한 도트 티켓 틀. 링크가 아닌 카드(놀이 결과 등)는 이 틀과 TicketStrip 을 직접 조합한다.
 * 티켓 틀 없이 색만 필요한 작은 요소(이어서 놀기 링크 등)는 accent 를 쓴다.
 */
export const ticketStyles = {
  accent: ACCENT,
  ticket: `${ACCENT} relative overflow-hidden rounded-lg border-3 border-(--accent-edge) bg-white shadow-[0.375rem_0.375rem_0_var(--accent)]`,
  strip:
    'flex items-center justify-between gap-2 bg-(--accent) px-4 py-[0.6rem] font-cafe24 text-xs leading-[1.4] tracking-[0.04em] text-(--accent-ink)',
  // 절취선 아래 아랫단. 순서 안내처럼 본문을 거드는 내용을 띠 색을 옅게 깔아 둔다.
  stub: 'border-t-2 border-dashed border-(--accent-edge)/40 bg-(--accent)/35',
  stubNumber:
    'flex size-6 shrink-0 items-center justify-center rounded-sm bg-(--accent) font-cafe24 text-xs leading-none text-(--accent-ink)',
} as const

/** 티켓 윗단: 영문 라벨과 작은 도트 아이콘. */
export function TicketStrip({ label, icon }: { label: ReactNode; icon?: ReactNode }) {
  return (
    <span className={ticketStyles.strip}>
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
        ticketStyles.ticket,
        'flex h-full flex-col focus-ring',
        // 누르는 순간 그림자 쪽으로 내려앉아 눌렸다는 걸 바로 알려준다.
        'transition-[translate,box-shadow] duration-120 ease-out active:translate-x-0.75 active:translate-y-0.75 active:shadow-[0.1875rem_0.1875rem_0_var(--accent)] motion-reduce:transition-none motion-reduce:active:translate-none',
        lift && 'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
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
