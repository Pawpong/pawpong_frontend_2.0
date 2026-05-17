import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'

interface SectionHeaderProps {
  title: string
  linkText?: string
  linkHref?: string
  /** 모바일 접기/펼치기 */
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}

const SectionHeader = ({
  title,
  linkText,
  linkHref,
  collapsible,
  collapsed,
  onToggle,
}: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[1.25rem]">
        {title}
      </p>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-[0.75rem] font-semibold text-[#5d5d5d] tab:text-[0.875rem]"
        >
          {`${linkText} >`}
        </Link>
      )}
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
