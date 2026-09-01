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
  /** 초기 검색어 — 탐색 페이지처럼 URL에 이미 검색어가 있는 경우 */
  defaultValue?: string
  /** 제출 시 동작. 미지정이면 SearchBar 기본값(탐색 페이지 이동) */
  onSubmit?: (keyword: string) => void
  /** 검색바 아래 인기 검색어 칩 노출 — 칩 클릭은 그 키워드로 검색 제출과 같게 동작한다 */
  showPopularKeywords?: boolean
}

const SearchSection = ({
  placeholder,
  className,
  withPadding = true,
  defaultValue,
  onSubmit,
  showPopularKeywords,
}: SearchSectionProps) => {
  return (
    <section
      className={cn(
        'my-3 flex flex-col items-center',
        withPadding && 'px-4 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex w-full max-w-[21.4375rem] flex-col gap-[0.4375rem] tab:max-w-[30.125rem] pc:max-w-[52.875rem]">
        <SearchBar placeholder={placeholder} defaultValue={defaultValue} onSubmit={onSubmit} />
        {showPopularKeywords && <PopularKeywords onSelect={onSubmit} />}
      </div>
    </section>
  )
}

export { SearchSection }
