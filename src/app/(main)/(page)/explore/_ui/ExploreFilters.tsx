'use client'

import { useId, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronDownIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { ANIMAL_CATEGORIES, CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'
import { Button, FilterTab, SideNav, Switch } from '@/shared/ui'
import {
  ADOPTION_STATUS_OPTIONS,
  ALL_REGIONS,
  CATEGORY_ICON,
  REGION_OPTIONS,
  SORT_OPTIONS,
} from '../_lib/constants'
import { useExploreTotal } from '../_lib/exploreQueries'
import { countExploreFilters, type ExploreQuery } from '../_lib/useExploreQuery'

interface ExploreFiltersProps {
  query: ExploreQuery
  onChange: (patch: Partial<ExploreQuery>) => void
}

const CategoryIcon = ({ category, className }: { category: AnimalCategory; className: string }) => (
  <Image
    src={CATEGORY_ICON[category]}
    alt=""
    width={32}
    height={32}
    loading="eager"
    className={cn('shrink-0 object-contain', className)}
  />
)

// 브리더 탐색은 '분양중' 하나만 거를 수 있어 스위치로, 입양 탐색은 상태가 셋이라 고르기로 둔다
const AvailableSwitch = ({ query, onChange }: ExploreFiltersProps) => (
  <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-body-md font-medium text-neutral-700">
    분양중인 브리더만 보기
    <Switch
      checked={query.status === 'available'}
      onCheckedChange={(checked) => onChange({ status: checked ? 'available' : 'all' })}
    />
  </label>
)

const GroupTitle = ({ children }: { children: ReactNode }) => (
  <p aria-hidden className="mb-2 px-4 text-xs font-semibold text-neutral-700">
    {children}
  </p>
)

/** PC 왼쪽 필터 — 커뮤니티 사이드바와 같은 목록(SideNav)으로 동물 종류·분양 상태·지역을 고른다 */
export const ExploreSideFilters = ({ query, onChange }: ExploreFiltersProps) => {
  const isBreeder = query.type === 'breeder'
  return (
    <aside
      aria-label="탐색 조건"
      className="sticky top-[calc(var(--header-h)+5rem)] hidden flex-col gap-6 lap:flex"
    >
      <div>
        <GroupTitle>동물 종류</GroupTitle>
        <SideNav
          label="동물 종류"
          items={ANIMAL_CATEGORIES.map((category) => ({
            key: category,
            label: CATEGORY_LABEL[category],
            icon: <CategoryIcon category={category} className="size-7" />,
            selected: query.category === category,
            onSelect: () => onChange({ category }),
          }))}
        />
      </div>
      <div>
        <GroupTitle>분양 상태</GroupTitle>
        {isBreeder ? (
          <div className="px-4">
            <AvailableSwitch query={query} onChange={onChange} />
          </div>
        ) : (
          <SideNav
            label="분양 상태"
            items={ADOPTION_STATUS_OPTIONS.map((option) => ({
              key: option.value,
              label: option.label,
              selected: query.status === option.value,
              onSelect: () => onChange({ status: option.value }),
            }))}
          />
        )}
      </div>
      {/* 지역은 브리더 탐색만 거를 수 있다 (입양 목록 API 에 지역 조건이 없다) */}
      {isBreeder && (
        <div>
          <GroupTitle>지역</GroupTitle>
          <SideNav
            label="지역"
            items={REGION_OPTIONS.map((option) => ({
              key: option.value,
              label: option.label,
              selected: query.region === option.value,
              onSelect: () => onChange({ region: option.value }),
            }))}
          />
        </div>
      )}
    </aside>
  )
}

const ChipRow = <Value extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: ReadonlyArray<{ value: Value; label: string }>
  value: Value
  onSelect: (value: Value) => void
}) => (
  <div className="flex items-start gap-3">
    <span className="w-16 shrink-0 pt-1.5 text-body-sm font-semibold text-neutral-700">
      {label}
    </span>
    <div role="group" aria-label={label} className="flex min-w-0 flex-wrap gap-1.5">
      {options.map((option) => (
        <FilterTab
          key={option.value}
          look="chip"
          selected={value === option.value}
          aria-pressed={value === option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </FilterTab>
      ))}
    </div>
  </div>
)

/**
 * 모바일 필터 — 동물 종류 칩은 늘 보이고, 나머지(정렬·지역·분양 상태)는 '필터' 칩으로 아래에 펼친다.
 * 고르는 즉시 목록에 걸리고(URL), 아래 버튼은 걸린 개수를 보여 주며 펼친 칸을 닫는다.
 */
export const ExploreMobileFilters = ({ query, onChange }: ExploreFiltersProps) => {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const total = useExploreTotal(query)
  const count = countExploreFilters(query)
  const isBreeder = query.type === 'breeder'

  return (
    <div className="flex flex-col gap-3 lap:hidden">
      <div className="flex items-center gap-2">
        <div
          role="group"
          aria-label="동물 종류"
          className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-1"
        >
          {ANIMAL_CATEGORIES.map((category) => (
            <FilterTab
              key={category}
              look="chip"
              selected={query.category === category}
              aria-pressed={query.category === category}
              onClick={() => onChange({ category })}
            >
              <CategoryIcon category={category} className="size-5" />
              {CATEGORY_LABEL[category]}
            </FilterTab>
          ))}
        </div>
        <FilterTab
          look="chip"
          selected={open || count > 0}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          필터{count > 0 && ` ${count}`}
          <ChevronDownIcon
            aria-hidden
            className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          />
        </FilterTab>
      </div>

      {open && (
        <div id={panelId} className="flex flex-col gap-4 rounded-xl bg-neutral-50 p-4">
          <ChipRow
            label="정렬"
            options={SORT_OPTIONS}
            value={query.sort}
            onSelect={(sort) => onChange({ sort })}
          />
          {isBreeder && (
            <ChipRow
              label="지역"
              options={REGION_OPTIONS}
              value={query.region}
              onSelect={(region) => onChange({ region })}
            />
          )}
          {isBreeder ? (
            <AvailableSwitch query={query} onChange={onChange} />
          ) : (
            <ChipRow
              label="분양 상태"
              options={ADOPTION_STATUS_OPTIONS}
              value={query.status}
              onSelect={(status) => onChange({ status })}
            />
          )}
          <div className="flex gap-2">
            <Button
              intent="secondary"
              size="md"
              width="fill"
              onClick={() => onChange({ sort: 'popular', status: 'all', region: ALL_REGIONS })}
            >
              초기화
            </Button>
            <div className="flex flex-[2]">
              <Button intent="dark" size="md" width="fill" onClick={() => setOpen(false)}>
                {total.toLocaleString()}
                {isBreeder ? '명의 브리더 보기' : '개의 분양글 보기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
