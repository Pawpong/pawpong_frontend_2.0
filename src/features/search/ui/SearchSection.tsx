import { SearchBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { PopularKeywords } from './PopularKeywords'

//QA: 홈 검색 영역 추가 — 기존 SearchBar/PopularKeywords 동작을 재사용하고 홈 스타일만 variant로 분리한다.
interface SearchSectionProps {
  variant?: 'default' | 'home'
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
  variant = 'default',
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
        variant === 'home'
          ? 'flex flex-col items-center justify-center px-4 py-3 tab:px-12 tab:py-5 pc:px-20 pc:py-5'
          : 'my-3 flex flex-col items-center',
        variant !== 'home' && withPadding && 'px-4 tab:px-12 pc:px-20',
        className,
      )}
    >
      <div className="flex w-full max-w-[21.4375rem] flex-col gap-[0.4375rem] tab:max-w-[30.125rem] pc:max-w-[52.875rem]">
        <SearchBar
          variant={variant}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onSubmit={onSubmit}
        />
        {showPopularKeywords && <PopularKeywords variant={variant} onSelect={onSubmit} />}
      </div>
    </section>
  )
}

export { SearchSection }
