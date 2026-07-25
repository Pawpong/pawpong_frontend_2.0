import { ArrowRightIcon } from '@/shared/assets/icons'
import { DetailLink } from './DetailLink'
import { textLabelVariants } from './TextLabel'
import { cn } from '@/shared/lib/cn'

// Figma: label txt btn (922-17441) — 라벨 + 우측 텍스트버튼(화살표).
// 타이틀 사이즈 램프: mo 14(medium) -> tab 16(large) -> pc 20(xlarge).
// titleClassName으로 덮을 땐 tab:/pc: 변형까지 함께 지정해야 기본값을 이긴다.

interface SectionHeaderProps {
  title: string
  subtitle?: string
  linkText?: string
  linkHref?: string
  /** 타이틀 텍스트 스타일 오버라이드 (색·크기·굵기 등) */
  titleClassName?: string
  /** PC 우측에 렌더링할 커스텀 요소 */
  rightSlot?: React.ReactNode
  /** 모바일 접기/펼치기 */
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}

const SectionHeader = ({
  title,
  subtitle,
  linkText,
  linkHref,
  titleClassName,
  rightSlot,
  collapsible,
  collapsed,
  onToggle,
}: SectionHeaderProps) => {
  return (
    <div className="flex flex-col gap-0.5 tab:gap-1">
      <div className="flex items-center justify-between">
        {/* [refactored] 타이틀 스타일을 공통 TextLabel 토큰(p-2px·600·#3e3e3e)에 위임 */}
        <p
          className={cn(
            textLabelVariants({ size: '14' }),
            'tab:text-base pc:text-xl',
            titleClassName,
          )}
        >
          {title}
        </p>
        {linkText && linkHref && (
          <DetailLink href={linkHref} label={linkText} size="sm" className="tab:text-[0.875rem]" />
        )}
        {collapsible && (
          <button type="button" onClick={onToggle} className="tab:hidden">
            <ArrowRightIcon
              className={cn(
                'size-[1.25rem] text-[#5d5d5d] transition-transform',
                collapsed ? 'rotate-90' : '-rotate-90',
              )}
            />
          </button>
        )}
      </div>
      {(subtitle || rightSlot) && (
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs font-bold text-[#898989] tab:text-base tab:font-semibold">
              {subtitle}
            </p>
          )}
          {rightSlot}
        </div>
      )}
    </div>
  )
}

export { SectionHeader }
