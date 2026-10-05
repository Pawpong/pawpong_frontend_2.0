import type { ReactNode } from 'react'
import { PawPrintIcon } from '@/shared/assets'

/** AI 필터와 같은 소개 영역: 픽셀 제목, 발바닥, 옅은 노란 배경. */
export function FeatureIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <header className="rounded-2xl border border-secondary-200 bg-point-50 p-5 tab:p-8">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
        <PawPrintIcon aria-hidden className="size-4 rotate-30 text-secondary-500" />
        {eyebrow}
      </p>
      <h1 className="mt-2 font-cafe24 text-2xl leading-snug break-keep text-neutral-850 tab:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed break-keep text-neutral-700">{children}</p>
    </header>
  )
}
