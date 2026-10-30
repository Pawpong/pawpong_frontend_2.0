'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  CommunityPixelIcon,
  type CommunityExperienceConfig,
  type CommunityPixelIconName,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/Dialog'
import { CommunityDiscoveryPanel } from './discovery/CommunityDiscoveryPanel'
import {
  categoryOf,
  COMMUNITY_CATEGORIES,
  countDetailFilters,
  subTopicOf,
  subTopicsOf,
  withCategory,
  withSubTopic,
} from './discovery/categories'

export { AppliedFilters } from './discovery/AppliedFilters'

type Change = (value: CommunityDiscoveryFilters) => void

// 맨 앞 '전체'는 카테고리 선택 해제
const CATEGORY_ITEMS: readonly { key?: string; label: string; icon: CommunityPixelIconName }[] = [
  { label: '전체', icon: 'all' },
  ...COMMUNITY_CATEGORIES,
]

// [refactored] 동물 타일·카테고리 줄이 같이 쓰는 '고른 항목' 모양 — 연한 띠 위에 흰 칩이 떠 보인다
const RAISED_SELECTED =
  'bg-base-white font-semibold text-primary-700 shadow-[0_0.0625rem_0_var(--color-primary-200)]'

/** 목록 제목에 붙일 카테고리 · 말머리 이름 */
export const discoveryTitle = (
  value: CommunityDiscoveryFilters,
  topicLabel: (key: string) => string,
): string[] => {
  const sub = subTopicOf(value)
  return [categoryOf(value)?.label, sub ? topicLabel(sub) : undefined].filter(
    (label): label is string => Boolean(label),
  )
}

/** 동물 대분류 — 아래 카테고리·말머리와 연결되는 첫 번째 줄. */
export function CommunityPetTiles<T extends string>({
  options,
  value,
  onChange,
  connected = false,
}: {
  options: readonly { value: T; shortLabel: string; icon: CommunityPixelIconName }[]
  value: T
  onChange: (value: T) => void
  connected?: boolean
}) {
  return (
    <div
      role="group"
      aria-label="동물별 이야기"
      className={cn(
        'grid grid-cols-4 gap-0.5 bg-secondary-50 p-1.5 pc:hidden',
        connected ? 'rounded-t-xl border-b border-secondary-200' : 'mb-4 rounded-xl',
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value || 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-12 min-w-0 items-center justify-center gap-1 rounded-lg px-1 text-body-sm whitespace-nowrap focus-ring transition-colors tab:gap-2 tab:text-body-md',
              selected ? RAISED_SELECTED : 'font-medium text-neutral-700 hover:bg-secondary-100', // [refactored]
            )}
          >
            <CommunityPixelIcon name={option.icon} className="size-7 tab:size-8" />
            <span>{option.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * 카테고리(대분류) + 말머리(소분류) — 모바일·태블릿 연한 띠 하나에 두 줄로 담는다.
 * 윗줄 카테고리는 아이콘 + 흰 칩 선택, 고르면 구분선 아래 말머리가 아이콘 없는 작은 글자 + 밑줄로 열린다.
 * PC 는 카테고리를 사이드바 목록(CommunityCategoryNav)이 맡고 말머리만 CommunitySubTopics 로 보여 준다.
 */
export function CommunityCategoryBand({
  value,
  onChange,
  topicLabel,
}: {
  value: CommunityDiscoveryFilters
  onChange: Change
  topicLabel: (key: string) => string
}) {
  const current = categoryOf(value)?.key
  return (
    // [refactored] 늘 동물 타일 아래에 붙어 그려져(connected) 위는 각지고 아래만 둥글다 — 쓰이지 않던 분기 제거
    <div className="mb-4 rounded-b-xl bg-secondary-50 pc:hidden">
      <div
        role="group"
        aria-label="카테고리"
        className="flex items-center gap-0.5 overflow-x-auto px-1.5 py-1.5"
      >
        {CATEGORY_ITEMS.map(({ key, label, icon }) => {
          const selected = current === key
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(withCategory(value, key))}
              className={cn(
                'touch-target relative inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-body-sm whitespace-nowrap focus-ring transition-colors tab:text-body-md',
                selected ? RAISED_SELECTED : 'font-medium text-neutral-700 hover:text-neutral-850', // [refactored]
              )}
            >
              <CommunityPixelIcon name={icon} className="text-primary-500" />
              {label}
            </button>
          )
        })}
      </div>
      <SubTopicTabs
        value={value}
        onChange={onChange}
        topicLabel={topicLabel}
        className="border-t border-secondary-200"
      />
    </div>
  )
}

/** 카테고리(대분류) — PC 사이드바 목록. 동물 목록과 같은 공통 목록을 쓴다 */
export function CommunityCategoryNav({
  value,
  onChange,
}: {
  value: CommunityDiscoveryFilters
  onChange: Change
}) {
  const current = categoryOf(value)?.key
  return (
    <CommunitySideNav
      label="카테고리"
      items={CATEGORY_ITEMS.map(({ key, label, icon }) => ({
        key: label,
        label,
        icon,
        selected: current === key,
        onSelect: () => onChange(withCategory(value, key)),
      }))}
    />
  )
}

/** PC 사이드바 목록 — 동물·카테고리가 같은 결(도트 아이콘 + 이름)을 쓴다 */
export function CommunitySideNav({
  label,
  items,
  iconClassName = 'size-5',
}: {
  label: string
  // [refactored] 아이콘 크기를 라벨 글자 비교 대신 prop 으로 받는다 (동물 그림은 size-8)
  iconClassName?: string
  items: readonly {
    key: string
    label: string
    icon: CommunityPixelIconName
    selected: boolean
    onSelect: () => void
  }[]
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-0.5">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={item.selected}
          onClick={item.onSelect}
          className={cn(
            'flex min-h-10 items-center gap-2.5 rounded-xl px-4 text-left text-body-md focus-ring transition-colors',
            item.selected
              ? 'bg-neutral-100 font-semibold text-neutral-850'
              : 'font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-850',
          )}
        >
          <CommunityPixelIcon name={item.icon} className={iconClassName} />
          {item.label}
        </button>
      ))}
    </nav>
  )
}

/** 말머리(소분류) — PC 본문 위 띠. 카테고리는 사이드바가 맡아 말머리 줄만 둔다 */
export function CommunitySubTopics({
  value,
  onChange,
  topicLabel,
}: {
  value: CommunityDiscoveryFilters
  onChange: Change
  topicLabel: (key: string) => string
}) {
  if (!subTopicsOf(value)) return null // [refactored]
  return (
    <div className="mb-4 hidden rounded-xl bg-secondary-50 pc:block">
      <SubTopicTabs value={value} onChange={onChange} topicLabel={topicLabel} />
    </div>
  )
}

/**
 * 말머리 글자 탭 줄 — 아이콘 없이 한 단계 작은 글자, 고른 탭만 밑줄로 표시해
 * 아이콘 + 흰 칩인 카테고리 줄보다 한 단계 아래라는 걸 보여 준다. 말머리가 없는 카테고리면 그리지 않는다.
 */
function SubTopicTabs({
  value,
  onChange,
  topicLabel,
  className,
}: {
  value: CommunityDiscoveryFilters
  onChange: Change
  topicLabel: (key: string) => string
  className?: string
}) {
  // [refactored] 말머리 유무 판단은 subTopicsOf 한 곳에서
  const topics = subTopicsOf(value)
  const category = categoryOf(value)
  if (!topics || !category) return null
  const current = subTopicOf(value)
  return (
    <div
      role="group"
      aria-label={`${category.label} 말머리`}
      className={cn('flex items-center gap-0.5 overflow-x-auto px-1.5', className)}
    >
      {[undefined, ...topics].map((topic) => {
        const selected = current === topic
        return (
          <button
            key={topic ?? 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(withSubTopic(value, topic))}
            // 밑줄은 ::before 로 그린다 — ::after 는 touch-target 이 터치 기기에서 누르는 영역을
            // 넓히는 데 쓰고 있어(가운데 정렬) 겹치면 밑줄이 글자 한가운데로 올라간다
            className={cn(
              'touch-target relative min-h-10 shrink-0 px-2.5 text-body-sm whitespace-nowrap focus-ring transition-colors tab:text-body-md',
              selected
                ? 'font-semibold text-primary-700 before:absolute before:inset-x-2.5 before:bottom-1.5 before:h-0.5 before:bg-primary-500'
                : 'font-medium text-neutral-700 hover:text-neutral-850',
            )}
          >
            {topic ? topicLabel(topic) : '전체'}
          </button>
        )
      })}
    </div>
  )
}

/** 세부 조건 — 목록 정렬 옆 필터 아이콘 버튼. 기록·태그·담긴 자료·올린 시기를 고른다 */
export function CommunityDetailFilter({
  config,
  value,
  onChange,
}: {
  config: CommunityExperienceConfig
  value: CommunityDiscoveryFilters
  onChange: Change
}) {
  const [open, setOpen] = useState(false)
  const count = countDetailFilters(value)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* 테두리 없는 아이콘 버튼 — 옆 정렬(글자 버튼)과 같은 무게로 둔다 */}
        <Button
          intent="ghost"
          size="sm"
          aria-label={count > 0 ? `세부 조건, ${count}개 적용됨` : '세부 조건'}
        >
          {/* 탐색 화면 필터 버튼과 같은 아이콘 — 글자 대신 아이콘으로 '조건 고르기'를 알린다 */}
          <Image
            src="/images/category/filter.svg"
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
          {count > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary-700 text-[0.6875rem] text-white">
              {count}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="top-auto bottom-0 flex max-h-[90dvh] w-full max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none p-0 tab:top-1/2 tab:bottom-auto tab:max-h-[85dvh] tab:w-[calc(100%-3rem)] tab:max-w-[42rem] tab:-translate-y-1/2 tab:rounded-2xl tab:p-0">
        {open && (
          <CommunityDiscoveryPanel
            config={config}
            initialValue={value}
            onApply={(next) => {
              onChange(next)
              setOpen(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
