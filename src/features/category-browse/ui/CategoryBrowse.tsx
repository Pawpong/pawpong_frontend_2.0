import Image from 'next/image'
import Link from 'next/link'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

// [refactored] 에셋 경로 상수화
const ASSETS = {
  buttonBg: '/images/category/btn-pixel-category.svg',
  searchIcon: '/images/category/search.svg',
}

const CATEGORIES = [
  { label: '강아지', href: '/explore?category=dog', icon: false },
  { label: '고양이', href: '/explore?category=cat', icon: false },
  { label: '도마뱀', href: '/explore?category=lizard', icon: false },
  { label: '브리더 탐색', href: '/explore?type=breeder', icon: true },
]

// [refactored] 카드 마크업을 별도 컴포넌트로 분리 (SRP)
interface CategoryCardProps {
  label: string
  href: string
  icon: boolean
}

const CategoryCard = ({ label, href, icon }: CategoryCardProps) => {
  return (
    <Link
      href={href}
      className="relative flex h-[2.125rem] w-[6.640625rem] items-center justify-center gap-[0.125rem] p-[0.5rem] transition-transform hover:scale-105 pc:h-[3.8371rem] pc:w-[11.990875rem]"
    >
      <Image src={ASSETS.buttonBg} alt="" fill className="object-fill" />
      <span
        className={cn(
          cafe24Proup.className,
          'relative z-10 font-cafe24 text-[0.625rem] leading-[1.5] font-normal whitespace-nowrap text-[#6b6b6b] pc:text-[1rem]',
        )}
      >
        {label}
      </span>
      {icon && (
        <span className="relative z-10 size-[1.25rem] shrink-0 pc:size-[2rem]">
          <Image src={ASSETS.searchIcon} alt="" fill className="object-contain" />
        </span>
      )}
    </Link>
  )
}

const CategoryBrowse = () => {
  return (
    /* 카테고리 영역 (Figma home-layout: mo py24/px16/gap8, tab py32/px48/gap12, pc py48/px80/gap12) */
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 tab:gap-3 tab:px-12 tab:py-8 pc:px-20 pc:py-12">
      <div className="mx-auto grid w-fit grid-cols-2 gap-x-[1.25rem] gap-y-[0.5rem] tab:grid-cols-4 tab:gap-y-0 pc:gap-x-[2rem]">
        {/* [refactored] 카드 렌더링을 CategoryCard로 위임 */}
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.label} {...category} />
        ))}
      </div>
    </div>
  )
}

export { CategoryBrowse }
