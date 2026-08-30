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
  /** 검색바 아래 인기 검색어 칩 노출 (홈 전용, Figma 2752-261253) */
  showPopularKeywords?: boolean
  /** 초기 검색어 — 탐색 페이지처럼 URL에 이미 검색어가 있는 경우 */
  defaultValue?: string
  /** 제출 시 동작. 미지정이면 SearchBar 기본값(탐색 페이지 이동) */
  onSubmit?: (keyword: string) => void
}

const SearchSection = ({
  placeholder,
  className,
  withPadding = true,
  showPopularKeywords,
  defaultValue,
  onSubmit,
}: SearchSectionProps) => {
  return (
    <section
      className={cn(
        'flex min-h-[5.9375rem] flex-col items-center justify-center py-3 tab:min-h-[7.25rem] tab:py-5',
        withPadding && 'px-4 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex w-full max-w-[21.4375rem] flex-col gap-[0.4375rem] tab:max-w-[30.125rem] pc:max-w-[52.875rem]">
        <SearchBar placeholder={placeholder} defaultValue={defaultValue} onSubmit={onSubmit} />
        {showPopularKeywords && <PopularKeywords />}
      </div>
    </section>
  )
}

export { SearchSection }
