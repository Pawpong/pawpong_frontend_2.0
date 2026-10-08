'use client'

import { useId, useState } from 'react'
import {
  COMMUNITY_MAX_FILTER_TOPICS,
  COMMUNITY_MAX_TAGS,
  COMMUNITY_RECORD_LABELS,
  COMMUNITY_TOPIC_GROUPS,
  countCommunityDiscovery,
  toCommunityTag,
  type CommunityExperienceConfig,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { DialogDescription, DialogTitle } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { AppliedFilters } from './AppliedFilters'
import { FilterOptions, filterPill } from './FilterControls'
import { KIND_LABELS, MEDIA_LABELS, PERIOD_LABELS } from './constants'

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
  const [groupIndex, setGroupIndex] = useState(0)
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')
  const topics = draft.topics ?? []
  const groups = COMMUNITY_TOPIC_GROUPS.filter((group) =>
    group.keys.some((key) => config.topics.some((topic) => topic.key === key)),
  )
  const group = groups[groupIndex] ?? groups[0]
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
  return (
    <>
      <header className="shrink-0 border-b border-neutral-100 px-5 py-5 pr-14 tab:px-6 tab:pr-14">
        <DialogTitle className="font-cafe24 text-xl">어떤 이야기를 찾으세요?</DialogTitle>
        <DialogDescription className="mt-1 text-xs">
          조건을 고른 뒤 적용해 주세요. 닫으면 현재 목록을 유지해요.
        </DialogDescription>
      </header>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 tab:px-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-850">
              관심 주제{' '}
              <span className="ml-1 font-normal text-neutral-500">
                {topics.length}/{COMMUNITY_MAX_FILTER_TOPICS}
              </span>
            </h2>
            <span className="text-xs text-neutral-500">여러 개 선택할 수 있어요</span>
          </div>
          <div
            role="group"
            aria-label="주제 분야"
            className="mb-4 flex flex-wrap gap-1 rounded-xl bg-neutral-50 p-1"
          >
            {groups.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-pressed={group === item}
                onClick={() => setGroupIndex(index)}
                className={cn(
                  'min-h-10 rounded-lg px-3 text-xs font-semibold focus-ring transition-colors',
                  group === item
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-850',
                )}
              >
                {item.title}
                {item.keys.some((key) => topics.includes(key)) && (
                  <span className="ml-1 text-primary-500">
                    {item.keys.filter((key) => topics.includes(key)).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label={group?.title ?? '관심 주제'}
            className="flex min-h-12 flex-wrap content-start gap-2"
          >
            {group?.keys
              .filter((key) => config.topics.some((topic) => topic.key === key))
              .map((key) => {
                const selected = topics.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    disabled={!selected && topics.length >= COMMUNITY_MAX_FILTER_TOPICS}
                    onClick={() => {
                      const next = selected
                        ? topics.filter((topic) => topic !== key)
                        : [...topics, key]
                      patch({ topics: next, ...(next.length < 2 ? { topicMatch: undefined } : {}) })
                    }}
                    className={cn(filterPill(selected), 'disabled:opacity-40')}
                  >
                    {config.topics.find((topic) => topic.key === key)?.label}
                  </button>
                )
              })}
          </div>
          {topics.length > 1 && (
            <div className="mt-4">
              <FilterOptions
                label="주제 일치 방식"
                options={{ any: '하나라도 포함', all: '모두 포함' }}
                value={draft.topicMatch ?? 'any'}
                onChange={(mode) => patch({ topicMatch: mode === 'all' ? 'all' : undefined })}
              />
            </div>
          )}
        </div>
        <div className="border-t border-neutral-100 pt-5">
          <FilterOptions
            label="기록 종류"
            options={COMMUNITY_RECORD_LABELS}
            value={draft.record}
            onChange={(record) => patch({ record })}
          />
        </div>
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
          <p id={`${id}-tag-hint`} className="mt-2 text-xs text-neutral-500">
            입력한 태그가 모두 달린 글을 찾아요.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-xs text-error-500">
              {error}
            </p>
          )}
        </form>
        <div className="grid gap-5 tab:grid-cols-2">
          <FilterOptions
            label="글 성격"
            options={KIND_LABELS}
            value={draft.kind}
            onChange={(kind) => patch({ kind })}
          />
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
        {countCommunityDiscovery(draft) > 0 && (
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs font-semibold text-neutral-700">선택한 조건</p>
            <AppliedFilters config={config} value={draft} onChange={setDraft} />
          </div>
        )}
        <p className="text-xs leading-relaxed text-neutral-500">
          서로 다른 조건은 함께 적용돼요. 진료 경험은 병원 평가나 의료 인증이 아니에요.
        </p>
      </div>
      <footer className="flex shrink-0 items-center gap-3 border-t border-neutral-100 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] tab:px-6">
        <Button
          intent="ghost"
          onClick={() => {
            setDraft({})
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
          {countCommunityDiscovery(draft) > 0 ? ` · ${countCommunityDiscovery(draft)}` : ''}
        </Button>
      </footer>
    </>
  )
}
