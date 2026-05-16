'use client'

import { cn } from '@/shared/lib/Cn'

interface ChipSelectProps {
  label: React.ReactNode
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
}

const ChipSelect = ({ label, items, selected, onToggle }: ChipSelectProps) => (
  <>
    {/* 선택된 칩 표시 영역 */}
    <div className="flex min-h-[2.5rem] flex-wrap items-center gap-[0.75rem] rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] tab:min-h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]">
      <span className="text-[0.875rem] leading-[1.375rem] font-medium text-[#5d5d5d] tab:text-[1rem]">
        {label}
      </span>
      {selected.map((item) => (
        <span
          key={item}
          className="rounded-full border border-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold text-[#a8a8a8]"
        >
          #{item}
        </span>
      ))}
    </div>

    {/* 칩 목록 */}
    <div className="mt-[0.75rem] flex flex-wrap gap-[1rem] px-[0.0175rem] tab:mt-[1.05rem] tab:px-[1.9375rem]">
      {items.map((item) => {
        const isSelected = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              'rounded-full px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold leading-[1.375rem]',
              isSelected
                ? 'bg-[#a8a8a8] text-white'
                : 'border border-[#a8a8a8] text-[#a8a8a8]',
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
