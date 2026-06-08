import Image from 'next/image'
import { PixelCategoryButton, PIXEL_CATEGORY_GRID } from '@/shared/ui'

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

const CategoryBrowse = () => {
  return (
    /* 카테고리 영역 (Figma home-layout: mo py24/px16/gap8, tab py32/px48/gap12, pc py48/px80/gap12) */
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 tab:gap-3 tab:px-12 tab:py-8 pc:px-20 pc:py-12">
      {/* [refactored] 픽셀 버튼을 공통 PixelCategoryButton으로 위임 */}
      <div className={PIXEL_CATEGORY_GRID}>
        {CATEGORIES.map(({ label, href, icon }) => (
          <PixelCategoryButton key={label} label={label} href={href} defaultSrc={ASSETS.buttonBg}>
            {icon && (
              <span className="relative z-10 size-[1.25rem] shrink-0 pc:size-[2rem]">
                <Image src={ASSETS.searchIcon} alt="" fill className="object-contain" />
              </span>
            )}
          </PixelCategoryButton>
        ))}
      </div>
    </div>
  )
}

export { CategoryBrowse }
