import type { ReactNode } from 'react'
import { PawIcon } from '@/shared/assets'
import { Container } from './Container'
import { NavigationBar } from './NavigationBar'

interface ComposerLayoutProps {
  title: string
  mobileTitle?: string
  category: string
  introTitle: ReactNode
  description: string
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
  onBack,
  children,
}: ComposerLayoutProps) {
  return (
    <div className="min-h-dvh bg-white text-neutral-850">
      <NavigationBar title={title} mobileTitle={mobileTitle} icon="close" onBack={onBack} />
      <Container className="py-5 pb-10 tab:py-8 pc:py-10">
        <div className="mx-auto max-w-264">
          <header className="relative mb-6 overflow-hidden rounded-xl bg-point-100 px-5 py-6 tab:mb-8 tab:px-8 tab:py-8">
            <div className="relative z-10 pc:pr-28">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-600">
                <PawIcon aria-hidden="true" className="size-5" />
                {category}
              </p>
              <h1 className="text-2xl leading-snug font-bold tracking-tight tab:text-3xl">
                {introTitle}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700 tab:text-base">
                {description}
              </p>
            </div>
            <PawIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-8 bottom-5 hidden size-24 -rotate-12 text-point-300 pc:block"
            />
          </header>
          {children}
        </div>
      </Container>
    </div>
  )
}

export function ComposerColumns({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-8 tab:grid-cols-2 pc:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] pc:gap-12">
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
