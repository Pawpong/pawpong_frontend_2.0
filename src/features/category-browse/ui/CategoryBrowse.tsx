import { SectionHeader } from '@/shared/ui'

const CATEGORIES = ['강아지', '고양이', '도마뱀', '브리더 탐색']

const CategoryBrowse = () => {
  return (
    <div className="flex flex-col gap-[0.75rem]">
      <SectionHeader title="둘러보기" />
      <div className="grid grid-cols-2 gap-[0.625rem] tab:grid-cols-4 tab:gap-[1.25rem]">
        {CATEGORIES.map((category) => (
          <div
            key={category}
            className="flex h-[4.875rem] items-center justify-center rounded-[0.375rem] bg-[#c6c6c6] tab:rounded-[1.0625rem]"
          >
            <span className="text-[0.875rem] font-semibold text-[#5d5d5d]">
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { CategoryBrowse }
