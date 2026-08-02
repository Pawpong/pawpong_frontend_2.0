import { SearchBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface SearchSectionProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  className?: string
  /** 독립 섹션이면 페이지 좌우 마진(px) 포함(홈), 이미 컨테이너 내부면 false(explore) */
  withPadding?: boolean
  /** 검색바 아래 "인기 검색어" 라벨 (홈 전용, Figma 2752-261253) — 없으면 미노출 */
  popularKeywords?: string[]
}

const SearchSection = ({
  placeholder,
  className,
  withPadding = true,
  popularKeywords,
}: SearchSectionProps) => {
  return (
    <section
      className={cn(
        'flex flex-col items-center py-3 tab:py-5',
        withPadding && 'px-4 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex w-full max-w-[21.4375rem] flex-col gap-3 tab:max-w-[30.125rem] pc:max-w-[52.875rem]">
        <SearchBar placeholder={placeholder} />
        {popularKeywords && popularKeywords.length > 0 && (
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <span className="shrink-0 text-xs leading-[1.5] font-medium text-neutral-700 tab:text-sm">
              인기 검색어
            </span>
            <div className="flex min-w-max items-center gap-1 tab:gap-2">
              {popularKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="flex h-6 items-center rounded-full border border-primary-500 px-2 text-[0.625rem] leading-[1.5] font-medium whitespace-nowrap text-primary-500 tab:h-auto tab:py-0.5 tab:text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { SearchSection }
