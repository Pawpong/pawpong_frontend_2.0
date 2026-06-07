import { SearchBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { PopularKeywords } from './PopularKeywords'

interface SearchSectionProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  className?: string
  /** 독립 섹션이면 페이지 좌우 마진(px) 포함(홈), 이미 컨테이너 내부면 false(explore) */
  withPadding?: boolean
}

const SearchSection = ({ placeholder, className, withPadding = true }: SearchSectionProps) => {
  return (
    <section
      className={cn(
        'flex flex-col items-center py-3 tab:py-5',
        withPadding && 'px-4 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-[0.4375rem] tab:max-w-[30.125rem] pc:max-w-[52.875rem]">
        <SearchBar placeholder={placeholder} />
        <PopularKeywords />
      </div>
    </section>
  )
}

export { SearchSection }
