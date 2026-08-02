import { SectionHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface TitledSectionProps {
  /** 섹션 제목 (개수 등은 호출부에서 포함) */
  title: string
  /** 제목 텍스트 스타일 오버라이드 */
  titleClassName?: string
  /** 섹션 래퍼 추가 클래스 (상단 여백·좌우 패딩 등) */
  className?: string
  /** 제목과 같은 행 우측에 표시할 요소 */
  headerSlot?: React.ReactNode
  children: React.ReactNode
}

// 섹션 헤더(제목) + 콘텐츠 래퍼
const TitledSection = ({
  title,
  titleClassName,
  className,
  headerSlot,
  children,
}: TitledSectionProps) => (
  <section className={cn('flex flex-col gap-[0.75rem]', className)}>
    {headerSlot ? (
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title={title} titleClassName={titleClassName} className="min-w-0 flex-1" />
        {headerSlot}
      </div>
    ) : (
      <SectionHeader title={title} titleClassName={titleClassName} />
    )}
    {children}
  </section>
)

export { TitledSection }
