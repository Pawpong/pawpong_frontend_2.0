'use client'

import { useState } from 'react'
import {
  COMMUNITY_RECORD_LABELS,
  CommunityPixelIcon,
  countCommunityDiscovery,
  type CommunityExperienceConfig,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/Dialog'
import { CommunityDiscoveryPanel } from './discovery/CommunityDiscoveryPanel'
import { AppliedFilters } from './discovery/AppliedFilters'
import { filterPill } from './discovery/FilterControls'
import { RECORD_KINDS } from './discovery/constants'

export function CommunityDiscovery({
  config,
  value,
  onChange,
}: {
  config: CommunityExperienceConfig
  value: CommunityDiscoveryFilters
  onChange: (value: CommunityDiscoveryFilters) => void
}) {
  const [open, setOpen] = useState(false)
  const count = countCommunityDiscovery(value)
  const patch = (next: Partial<CommunityDiscoveryFilters>) => onChange({ ...value, ...next })
  return (
    <section aria-label="이야기 찾기" className="mb-5">
      <div className="flex items-start gap-2">
        <div
          className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 tab:flex-wrap"
          aria-label="빠른 탐색"
        >
          {RECORD_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={value.record === kind}
              onClick={() => patch({ record: value.record === kind ? undefined : kind })}
              className={filterPill(value.record === kind)}
            >
              <CommunityPixelIcon name={kind} className="text-primary-500" />
              {COMMUNITY_RECORD_LABELS[kind]}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={value.kind === 'question'}
            onClick={() => patch({ kind: value.kind === 'question' ? undefined : 'question' })}
            className={filterPill(value.kind === 'question')}
          >
            <CommunityPixelIcon name="question" className="text-primary-500" />
            질문
          </button>
          <button
            type="button"
            aria-pressed={value.media === 'map'}
            onClick={() => patch({ media: value.media === 'map' ? undefined : 'map' })}
            className={filterPill(value.media === 'map')}
          >
            <CommunityPixelIcon name="travel" className="text-primary-500" />
            장소 지도
          </button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-850 focus-ring hover:bg-neutral-50"
            >
              상세 필터
              {count > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-700 text-[0.6875rem] text-white">
                  {count}
                </span>
              )}
            </button>
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
      </div>
      <AppliedFilters config={config} value={value} onChange={onChange} />
    </section>
  )
}
