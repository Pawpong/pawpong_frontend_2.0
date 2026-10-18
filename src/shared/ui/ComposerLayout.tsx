import type { ReactNode } from 'react'
import { PawPrintIcon } from '@/shared/assets'
import { Container } from './Container'
import { NavigationBar } from './NavigationBar'
import { TicketStrip, ticketStyles, type TicketAccent } from './Ticket'

interface ComposerLayoutProps {
  title: string
  mobileTitle?: string
  category?: string
  introTitle: ReactNode
  description: string
  /** 놀이터 기록 도구(WALK NOTE 등)에서 들어온 글은 같은 티켓 띠로 머리를 그린다. */
  introTicket?: { label: string; accent: TicketAccent; icon?: ReactNode }
  onBack: () => void
  children: ReactNode
}

/** Shared brand shell for community and contest composers. */
export function ComposerLayout({
  title,
  mobileTitle,
  category,
  introTitle,
  description,
  introTicket,
  onBack,
  children,
}: ComposerLayoutProps) {
  return (
    <div className="min-h-dvh bg-white text-neutral-850">
      <NavigationBar title={title} mobileTitle={mobileTitle} icon="close" onBack={onBack} />
      <Container className="py-5 pb-10 tab:py-8 pc:py-10">
        <div className="mx-auto max-w-264">
          {introTicket ? (
            <header
              data-accent={introTicket.accent}
              className={`${ticketStyles.ticket} mb-6 tab:mb-8`}
            >
              <TicketStrip label={introTicket.label} icon={introTicket.icon} />
              <div className="px-5 py-5 tab:px-8 tab:py-6">
                <h1 className="font-cafe24 text-xl leading-[1.5] break-keep tab:text-2xl">
                  {introTitle}
                </h1>
                <p className="mt-2 text-sm leading-relaxed break-keep text-neutral-700 tab:text-base">
                  {description}
                </p>
              </div>
            </header>
          ) : (
            <header className="relative mb-6 overflow-hidden rounded-xl bg-point-100 px-5 py-6 tab:mb-8 tab:px-8 tab:py-8">
              <div className="relative z-10 pc:pr-28">
                {category && (
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-600">
                    <PawPrintIcon aria-hidden="true" className="size-6" />
                    {category}
                  </p>
                )}
                <h1 className="font-cafe24 text-xl leading-[1.5] tab:text-2xl">{introTitle}</h1>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700 tab:text-base">
                  {description}
                </p>
              </div>
              <PawPrintIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-8 bottom-5 hidden size-28 -rotate-12 text-point-300 pc:block"
              />
            </header>
          )}
          {children}
        </div>
      </Container>
    </div>
  )
}

export function ComposerColumns({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-8 pc:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] pc:gap-12">
      {children}
    </div>
  )
}

interface ComposerSectionHeadingProps {
  id: string
  step: number
  children: ReactNode
  required?: boolean
  htmlFor?: string
  trailing?: ReactNode
}

export function ComposerSectionHeading({
  id,
  step,
  children,
  required,
  htmlFor,
  trailing,
}: ComposerSectionHeadingProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
        {step}
      </span>
      <h2 id={id} className="text-base font-semibold">
        {htmlFor ? <label htmlFor={htmlFor}>{children}</label> : children}
      </h2>
      <span className={required ? 'text-xs text-primary-600' : 'text-xs text-neutral-700'}>
        {required ? '필수' : '선택'}
      </span>
      {trailing && <span className="ml-auto text-xs text-neutral-700">{trailing}</span>}
    </div>
  )
}
