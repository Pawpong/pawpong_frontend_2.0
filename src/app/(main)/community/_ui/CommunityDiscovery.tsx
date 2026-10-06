'use client'

import { useId, useState } from 'react'
import {
  COMMUNITY_MAX_FILTER_TOPICS,
  COMMUNITY_MAX_TAGS,
  COMMUNITY_RECORD_LABELS,
  COMMUNITY_TOPIC_GROUPS,
  CommunityPixelIcon,
  countCommunityDiscovery,
  toCommunityTag,
  type CommunityExperienceConfig,
  type CommunityPixelIconName,
} from '@/entities/community'
import type { CommunityDiscoveryFilters, CommunityRecordKind } from '@/shared/types'
import { cn } from '@/shared/lib/cn'

const KIND_LABELS = { question: '질문', story: '경험·후기' } as const
const MEDIA_LABELS = { photos: '사진 있는 글', map: '지도 있는 글' } as const
const PERIOD_LABELS = { week: '최근 7일', month: '최근 30일' } as const
const RECORD_KINDS: CommunityRecordKind[] = ['walk', 'clinic', 'life']

const pill = (selected: boolean) =>
  cn(
    'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap focus-ring transition-colors',
    selected
      ? 'border-primary-500 bg-secondary-200 font-bold text-primary-700'
      : 'border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-secondary-50',
  )

function QuickFilter({
  icon,
  selected,
  onClick,
  children,
}: {
  icon?: CommunityPixelIconName
  selected: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={pill(selected)}>
      {icon && <CommunityPixelIcon name={icon} className="text-primary-500" />}
      {children}
    </button>
  )
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Record<T, string>
  value: T | undefined
  onChange: (value: T | undefined) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-bold text-neutral-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(value === key ? undefined : key)}
            className={pill(value === key)}
          >
            {options[key]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** 피드 탐색 필터 — 값은 주소에 담겨 있어 뒤로 가기·공유·다시 방문에서도 유지된다. */
export function CommunityDiscovery({
  config,
  value,
  onChange,
}: {
  config: CommunityExperienceConfig
  value: CommunityDiscoveryFilters
  onChange: (value: CommunityDiscoveryFilters) => void
}) {
  const id = useId()
  const [expanded, setExpanded] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [tagError, setTagError] = useState('')
  const topics = value.topics ?? []
  const tags = value.tags ?? []
  const count = countCommunityDiscovery(value)
  const patch = (next: Partial<CommunityDiscoveryFilters>) => onChange({ ...value, ...next })
  const label = (key: string) => config.topics.find((topic) => topic.key === key)?.label ?? key

  const addTag = () => {
    if (!tagDraft.trim()) return
    const tag = toCommunityTag(tagDraft)
    if (!tag) return setTagError('태그는 한글·영문·숫자로 20자까지 쓸 수 있어요.')
    if (tags.includes(tag)) return setTagError('이미 찾고 있는 태그예요.')
    if (tags.length >= COMMUNITY_MAX_TAGS)
      return setTagError(`태그는 ${COMMUNITY_MAX_TAGS}개까지 함께 찾을 수 있어요.`)
    patch({ tags: [...tags, tag] })
    setTagDraft('')
    setTagError('')
  }

  const applied: { key: string; text: string; clear: () => void }[] = [
    ...(value.record
      ? [
          {
            key: 'record',
            text: COMMUNITY_RECORD_LABELS[value.record],
            clear: () => patch({ record: undefined }),
          },
        ]
      : []),
    ...topics.map((topic) => ({
      key: `topic-${topic}`,
      text: label(topic),
      clear: () => patch({ topics: topics.filter((item) => item !== topic) }),
    })),
    ...tags.map((tag) => ({
      key: `tag-${tag}`,
      text: `#${tag}`,
      clear: () => patch({ tags: tags.filter((item) => item !== tag) }),
    })),
    ...(value.kind
      ? [{ key: 'kind', text: KIND_LABELS[value.kind], clear: () => patch({ kind: undefined }) }]
      : []),
    ...(value.media
      ? [
          {
            key: 'media',
            text: MEDIA_LABELS[value.media],
            clear: () => patch({ media: undefined }),
          },
        ]
      : []),
    ...(value.period
      ? [
          {
            key: 'period',
            text: PERIOD_LABELS[value.period],
            clear: () => patch({ period: undefined }),
          },
        ]
      : []),
  ]

  return (
    <section aria-label="이야기 찾기" className="mb-5">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 tab:mx-0 tab:flex-wrap tab:px-0">
        {RECORD_KINDS.map((kind) => (
          <QuickFilter
            key={kind}
            icon={kind}
            selected={value.record === kind}
            onClick={() => patch({ record: value.record === kind ? undefined : kind })}
          >
            {COMMUNITY_RECORD_LABELS[kind]}
          </QuickFilter>
        ))}
        <QuickFilter
          icon="question"
          selected={value.kind === 'question'}
          onClick={() => patch({ kind: value.kind === 'question' ? undefined : 'question' })}
        >
          질문
        </QuickFilter>
        <QuickFilter
          icon="travel"
          selected={value.media === 'map'}
          onClick={() => patch({ media: value.media === 'map' ? undefined : 'map' })}
        >
          지도 있는 글
        </QuickFilter>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
          onClick={() => setExpanded(!expanded)}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-primary-500 bg-white px-3 text-sm font-bold whitespace-nowrap text-primary-700 focus-ring hover:bg-primary-50"
        >
          {expanded ? '필터 접기' : '주제·태그로 찾기'}
          <span aria-hidden className={cn('transition-transform', expanded && 'rotate-180')}>
            ▾
          </span>
        </button>
      </div>

      {expanded && (
        <div
          id={`${id}-panel`}
          className="mt-3 space-y-5 rounded-2xl border border-primary-200 bg-secondary-50 p-4 tab:p-5"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-cafe24 text-sm text-primary-700">
                주제{' '}
                <span className="font-sans text-xs font-medium text-neutral-600">
                  {topics.length}/{COMMUNITY_MAX_FILTER_TOPICS}
                </span>
              </h2>
              {topics.length > 1 && (
                <div role="group" aria-label="주제 일치 방식" className="flex gap-1">
                  {(['any', 'all'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={(value.topicMatch ?? 'any') === mode}
                      onClick={() => patch({ topicMatch: mode === 'all' ? 'all' : undefined })}
                      className={cn(
                        'min-h-8 rounded-lg px-2.5 text-xs focus-ring',
                        (value.topicMatch ?? 'any') === mode
                          ? 'bg-primary-700 font-bold text-white'
                          : 'bg-white font-medium text-neutral-700',
                      )}
                    >
                      {mode === 'any' ? '하나라도' : '모두 포함'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 grid gap-3 tab:grid-cols-2">
              {COMMUNITY_TOPIC_GROUPS.map((group) => {
                const keys = group.keys.filter((key) =>
                  config.topics.some((topic) => topic.key === key),
                )
                if (!keys.length) return null
                return (
                  <fieldset key={group.title} className="min-w-0 rounded-xl bg-white p-3">
                    <legend className="px-1 text-xs font-bold text-neutral-700">
                      {group.title}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {keys.map((key) => {
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
                              patch({
                                topics: next,
                                ...(next.length < 2 ? { topicMatch: undefined } : {}),
                              })
                            }}
                            className={cn(pill(selected), 'disabled:opacity-40')}
                          >
                            {label(key)}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                )
              })}
            </div>
          </div>

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              addTag()
            }}
          >
            <label
              htmlFor={`${id}-tag`}
              className="flex items-center gap-2 font-cafe24 text-sm text-primary-700"
            >
              <CommunityPixelIcon name="tag" className="text-primary-500" />
              태그
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id={`${id}-tag`}
                value={tagDraft}
                maxLength={21}
                enterKeyHint="search"
                autoComplete="off"
                aria-invalid={tagError ? true : undefined}
                aria-describedby={`${id}-tag-hint`}
                placeholder="예: 노령견, 슬개골"
                onChange={(event) => {
                  setTagDraft(event.target.value)
                  if (tagError) setTagError('')
                }}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring tab:text-sm"
              />
              <button
                type="submit"
                disabled={!tagDraft.trim()}
                className="min-h-11 shrink-0 rounded-lg border border-primary-500 bg-white px-4 text-sm font-bold text-primary-700 focus-ring hover:bg-primary-50 disabled:border-neutral-200 disabled:text-neutral-400"
              >
                찾기
              </button>
            </div>
            <p id={`${id}-tag-hint`} className="mt-2 text-xs leading-relaxed text-neutral-700">
              넣은 태그가 모두 달린 글을 찾아요.
            </p>
            {tagError && (
              <p role="alert" className="mt-1 text-xs font-medium text-error-500">
                {tagError}
              </p>
            )}
          </form>

          <div className="grid gap-4 tab:grid-cols-3">
            <Segmented
              label="글 성격"
              options={KIND_LABELS}
              value={value.kind}
              onChange={(kind) => patch({ kind })}
            />
            <Segmented
              label="담긴 자료"
              options={MEDIA_LABELS}
              value={value.media}
              onChange={(media) => patch({ media })}
            />
            <Segmented
              label="올린 시기"
              options={PERIOD_LABELS}
              value={value.period}
              onChange={(period) => patch({ period })}
            />
          </div>
          <p className="text-xs leading-relaxed text-neutral-700">
            고른 조건을 모두 만족하는 글만 보여요. 진료 경험은 병원 평가나 의료 인증이 아니에요.
          </p>
        </div>
      )}

      {count > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="적용한 필터">
          {applied.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-label={`${item.text} 필터 해제`}
              onClick={item.clear}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary-700 px-3 text-xs font-semibold text-white focus-ring hover:bg-primary-600"
            >
              {item.text}
              <span aria-hidden className="text-sm leading-none">
                ×
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange({})
              setTagDraft('')
              setTagError('')
            }}
            className="min-h-8 rounded-lg px-2 text-xs font-semibold text-neutral-700 underline focus-ring"
          >
            모두 지우기
          </button>
        </div>
      )}
    </section>
  )
}
