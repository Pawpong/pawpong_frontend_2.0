'use client'

import { TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface ChipSelectProps {
  label: React.ReactNode
  items: string[]
  value: string[]
  onChange: (next: string[]) => void
}

// [refactored] onToggle(item) → value/onChange(next). 토글 로직을 내부로 흡수해
// 콜러(InfoStep·KennelInfoStep)의 판박이 includes?filter:[...] 중복 제거 + RHF field 직결
const ChipSelect = ({ label, items, value, onChange }: ChipSelectProps) => {
  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item])

  return (
    // 라벨↔칩 간격은 mt가 아니라 flex-col gap으로 (Figma 966-21526)
    <div className="flex w-full flex-col items-start gap-1">
      {/* 라벨 — 공통 TextLabel(p-2px), 모바일 14 / tab+ 16, bold #3e3e3e */}
      <TextLabel size="14" className="tab:text-base">
        {label}
      </TextLabel>

      {/* 칩 목록
          - 모바일: 고정 높이 스크롤 + 하단 흰색 페이드, gap 20px, 가운데 정렬 (Figma 966-29420)
          - tab+: 전체 노출, 가로 gap 8px·세로 20px, 좌측 정렬 (Figma 966-21528) */}
      <div className="relative w-full">
        <div className="flex max-h-[15rem] w-full flex-wrap justify-center gap-5 overflow-y-auto pb-16 tab:max-h-none tab:justify-start tab:gap-x-2 tab:overflow-visible tab:pb-0">
          {items.map((item) => {
            const isSelected = value.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggle(item)}
                className={cn(
                  'rounded-full px-2 py-1 text-body-s font-medium',
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
        {/* 하단 흰색 페이드 — 스크롤 컨테이너 기준 고정, 모바일 전용 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white tab:hidden" />
      </div>
    </div>
  )
}

export { ChipSelect }
