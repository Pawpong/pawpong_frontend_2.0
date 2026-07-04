import { SectionHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface TitledSectionProps {
  /** 섹션 제목 (개수 등은 호출부에서 포함) */
  title: string
  /** 제목 텍스트 스타일 오버라이드 */
  titleClassName?: string
  /** 섹션 래퍼 추가 클래스 (상단 여백·좌우 패딩 등) */
  className?: string
  children: React.ReactNode
}

// 섹션 헤더(제목) + 콘텐츠 래퍼
const TitledSection = ({
  title,
  titleClassName,
  className,
  children,
}: TitledSectionProps) => (
  <section className={cn('flex flex-col gap-[0.75rem]', className)}>
    <SectionHeader title={title} titleClassName={titleClassName} />
    {children}
  </section>
)

export { TitledSection }
