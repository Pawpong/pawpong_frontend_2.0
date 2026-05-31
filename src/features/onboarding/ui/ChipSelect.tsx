'use client'

import { cn } from '@/shared/lib/cn'

interface ChipSelectProps {
  label: React.ReactNode
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
}

const ChipSelect = ({ label, items, selected, onToggle }: ChipSelectProps) => (
  <>
    {/* 라벨 */}
    <p className="text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base tab:font-bold">
      {label}
    </p>

    {/* 칩 목록 */}
    <div className="mt-1 flex flex-wrap content-center justify-center gap-[0.75rem] tab:mt-[0.25rem] tab:gap-[1.25rem]">
      {items.map((item) => {
        const isSelected = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              'rounded-full px-2 py-1 text-[0.875rem] leading-[1.5] font-medium tab:text-base',
              isSelected
                ? 'border border-[#3e3e3e] bg-[#3e3e3e] text-white'
                : 'border border-[#cacaca] text-[#6b6b6b]',
            )}
          >
            {item}
          </button>
        )
      })}
    </div>
  </>
)

export { ChipSelect }
