import type { ReactNode } from 'react'
import { PawPrintIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface FullPageMessageProps {
  title: string
  description: ReactNode
  badge?: string
  actions?: ReactNode
  className?: string
}

/** 404·전역 오류처럼 페이지 전체를 대신하는 브랜드 피드백 화면. */
const FullPageMessage = ({
  title,
  description,
  badge,
  actions,
  className,
}: FullPageMessageProps) => (
  <main
    className={cn(
      'flex min-h-dvh w-full items-center justify-center bg-primary-50/20 px-4 py-12 tab:px-12 pc:px-20',
      className,
    )}
  >
    <section className="flex w-full max-w-md flex-col items-center rounded-2xl border border-neutral-150 bg-white px-5 py-10 text-center shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:px-8 tab:py-12">
      <span className="flex size-16 items-center justify-center rounded-full bg-point-100 text-primary-500">
        <PawPrintIcon className="size-9" aria-hidden />
      </span>
      {badge && (
        <p className="mt-5 text-xs font-semibold tracking-[0.08em] text-primary-600 uppercase">
          {badge}
        </p>
      )}
      <h1 className="mt-2 font-cafe24 text-xl leading-[1.5] text-neutral-850 tab:text-2xl">
        {title}
      </h1>
      <div className="mt-3 text-sm leading-[1.6] font-medium text-neutral-700 tab:text-base">
        {description}
      </div>
      {actions && <div className="mt-7 flex w-full flex-col gap-2.5 tab:flex-row">{actions}</div>}
    </section>
  </main>
)

export { FullPageMessage }
export type { FullPageMessageProps }
