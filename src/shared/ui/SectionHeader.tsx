import { ArrowRightIcon } from '@/shared/assets/icons'
import { DetailLink } from './DetailLink'
import { cn } from '@/shared/lib/cn'

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
        <p
          className={cn(
            'text-sm leading-[1.5] font-bold text-text-primary tab:text-xl',
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
