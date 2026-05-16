import Link from 'next/link'
import { SectionHeader } from '@/shared/ui'

const CATEGORIES = [
  { label: '강아지', href: '' },
  { label: '고양이', href: '' },
  { label: '도마뱀', href: '' },
  { label: '브리더 탐색', href: '/explore' },
]

const CategoryBrowse = () => {
  return (
    <div className="flex flex-col gap-[0.75rem]">
      <SectionHeader title="둘러보기" />
      <div className="grid grid-cols-2 gap-[0.625rem] tab:grid-cols-4 tab:gap-[1.25rem]">
        {CATEGORIES.map((category) => {
          const inner = (
            <span className="text-[0.875rem] font-semibold text-[#5d5d5d]">
              {category.label}
            </span>
          )

          const baseClass =
            'flex h-[4.875rem] items-center justify-center rounded-[0.375rem] bg-[#c6c6c6] tab:rounded-[1.0625rem]'

          return category.href ? (
            <Link key={category.label} href={category.href} className={baseClass}>
              {inner}
            </Link>
          ) : (
            <div key={category.label} className={baseClass}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { CategoryBrowse }
