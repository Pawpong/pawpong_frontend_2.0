import { ArrowRightIcon } from '@/shared/assets/icons'
import { DetailLink } from './DetailLink'
import { cn } from '@/shared/lib/Cn'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  linkText?: string
  linkHref?: string
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
  rightSlot,
  collapsible,
  collapsed,
  onToggle,
}: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5 tab:gap-1">
        <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-xl">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs font-bold text-[#898989] tab:text-base tab:font-semibold">
            {subtitle}
          </p>
        )}
      </div>
      {linkText && linkHref && (
        <DetailLink href={linkHref} label={linkText} size="sm" className="tab:text-[0.875rem]" />
      )}
      {rightSlot}
      {collapsible && (
        <button
          type="button"
          onClick={onToggle}
          className="tab:hidden"
        >
          <ArrowRightIcon
            className={cn(
              'size-[1.25rem] text-[#5d5d5d] transition-transform',
              collapsed ? 'rotate-90' : '-rotate-90',
            )}
          />
        </button>
      )}
    </div>
  )
}

export { SectionHeader }
