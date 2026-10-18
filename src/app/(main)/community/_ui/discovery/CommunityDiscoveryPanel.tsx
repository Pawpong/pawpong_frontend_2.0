'use client'

import { useId, useState } from 'react'
import {
  COMMUNITY_MAX_TAGS,
  toCommunityTag,
  type CommunityExperienceConfig,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { AppliedFilters } from './AppliedFilters'
import { FilterOptions } from './FilterControls'
import { MEDIA_LABELS, PERIOD_LABELS } from './constants'
import { countDetailFilters, keepCategory } from './categories'

/**
 * 세부 조건 — 카테고리·말머리(무슨 이야기)는 목록 위에서 고르고,
 * 여기서는 그 안을 태그·담긴 자료·올린 시기(어떤 글)로 좁힌다.
 */
export function CommunityDiscoveryPanel({
  config,
  initialValue,
  onApply,
}: {
  config: CommunityExperienceConfig
  initialValue: CommunityDiscoveryFilters
  onApply: (value: CommunityDiscoveryFilters) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState(initialValue)
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')
  const patch = (next: Partial<CommunityDiscoveryFilters>) => setDraft({ ...draft, ...next })
  const withPendingTag = (): CommunityDiscoveryFilters | null => {
    if (!tag.trim()) return draft
    const normalized = toCommunityTag(tag)
    if (!normalized) {
      setError('태그는 한글·영문·숫자로 20자까지 입력해 주세요.')
      return null
    }
    if (draft.tags?.includes(normalized)) {
      setTag('')
      setError('')
      return draft
    }
    if ((draft.tags?.length ?? 0) >= COMMUNITY_MAX_TAGS) {
      setError(`태그는 ${COMMUNITY_MAX_TAGS}개까지 고를 수 있어요.`)
      return null
    }
    return { ...draft, tags: [...(draft.tags ?? []), normalized] }
  }
  const addTag = () => {
    const next = withPendingTag()
    if (!next) return
    setDraft(next)
    setTag('')
    setError('')
  }
  const count = countDetailFilters(draft)
  return (
    <>
      <header className="shrink-0 border-b border-neutral-100 px-5 py-5 pr-14 tab:px-6 tab:pr-14">
        <DialogTitle className="font-cafe24 text-xl">세부 조건</DialogTitle>
        <DialogDescription className="mt-1 text-xs">
          고른 카테고리 안에서 태그·자료·시기로 더 좁혀요. 닫으면 현재 목록을 유지해요.
        </DialogDescription>
      </header>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 tab:px-6">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            addTag()
          }}
        >
          <label htmlFor={`${id}-tag`} className="text-sm font-semibold text-neutral-850">
            태그로 더 자세히
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={`${id}-tag`}
              value={tag}
              maxLength={21}
              autoComplete="off"
              enterKeyHint="done"
              aria-invalid={!!error}
              aria-describedby={`${id}-tag-hint`}
              placeholder="예: 노령견, 슬개골 (한 번에 하나씩)"
              onChange={(event) => {
                setTag(event.target.value)
                setError('')
              }}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 text-base focus-ring tab:text-sm"
            />
            <Button type="submit" intent="secondary" size="sm" disabled={!tag.trim()}>
              추가
            </Button>
          </div>
          <p id={`${id}-tag-hint`} className="mt-2 text-xs text-neutral-700">
            입력한 태그가 모두 달린 글을 찾아요.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-xs text-error-500">
              {error}
            </p>
          )}
        </form>
        <div className="grid gap-5 border-t border-neutral-100 pt-5 tab:grid-cols-2">
          <FilterOptions
            label="담긴 자료"
            options={MEDIA_LABELS}
            value={draft.media}
            onChange={(media) => patch({ media })}
          />
          <FilterOptions
            label="올린 시기"
            options={PERIOD_LABELS}
            value={draft.period}
            onChange={(period) => patch({ period })}
          />
        </div>
        {count > 0 && (
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs font-semibold text-neutral-700">선택한 조건</p>
            <AppliedFilters config={config} value={draft} onChange={setDraft} />
          </div>
        )}
        <p className="text-xs leading-relaxed text-neutral-700">
          서로 다른 조건은 함께 적용돼요. 진료 경험은 병원 평가나 의료 인증이 아니에요.
        </p>
      </div>
      <footer className="flex shrink-0 items-center gap-3 border-t border-neutral-100 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] tab:px-6">
        <Button
          intent="ghost"
          onClick={() => {
            setDraft(keepCategory(draft))
            setTag('')
            setError('')
          }}
        >
          초기화
        </Button>
        <Button
          width="full"
          size="lg"
          onClick={() => {
            const next = withPendingTag()
            if (next) onApply(next)
          }}
        >
          이 조건으로 보기
          {count > 0 ? ` · ${count}` : ''}
        </Button>
      </footer>
    </>
  )
}
