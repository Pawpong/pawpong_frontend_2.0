import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Container } from './Container'
import { SectionHeader } from './SectionHeader'

interface ShowcaseSectionProps {
  title: string
  linkText: string
  linkHref: string
  children: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
  linkClassName?: string
}

/** 홈의 카드형 쇼케이스 섹션 공통 셸. */
const ShowcaseSection = ({
  title,
  linkText,
  linkHref,
  children,
  className,
  contentClassName,
  titleClassName,
  linkClassName,
}: ShowcaseSectionProps) => (
  <Container className={cn('px-4 py-4 pc:px-20 pc:py-10', className)}>
    <section className={cn('flex flex-col gap-3', contentClassName)}>
      <SectionHeader
        title={title}
        linkText={linkText}
        linkHref={linkHref}
        className="h-[1.875rem] justify-center pc:h-auto"
        titleClassName={cn(
          'p-0 font-cafe24 text-xs leading-[1.5] font-normal whitespace-nowrap text-neutral-850 tab:text-sm pc:text-xl',
          titleClassName,
        )}
        linkClassName={cn('tab:text-xs pc:text-sm', linkClassName)}
      />
      {children}
    </section>
  </Container>
)

export { ShowcaseSection }
export type { ShowcaseSectionProps }
