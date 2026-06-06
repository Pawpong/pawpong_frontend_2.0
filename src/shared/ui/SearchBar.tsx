import { cn } from '@/shared/lib/cn'
import { SearchIcon } from './SearchIcon'

interface SearchBarProps {
  placeholder?: {
    mobile: string
    desktop: string
  }
  className?: string
}

const DEFAULT_PLACEHOLDER = {
  mobile: '검색해서 원하는 동물 찾기',
  desktop: '검색해서 원하는 아이 찾기',
}

// Figma: h56 / rounded8 / border #a6a6a6 / p12, placeholder Pretendard medium 16px #a6a6a6, 우측 32px 검색 아이콘
export const SearchBar = ({ placeholder = DEFAULT_PLACEHOLDER, className }: SearchBarProps) => {
  return (
    <div
      className={cn(
        'flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-[#a6a6a6] bg-white p-3',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-base leading-[1.5] font-medium text-[#a6a6a6]">
        <span className="tab:hidden">{placeholder.mobile}</span>
        <span className="hidden tab:inline">{placeholder.desktop}</span>
      </span>
      <SearchIcon className="size-8 shrink-0 text-[#6b6b6b]" />
    </div>
  )
}
