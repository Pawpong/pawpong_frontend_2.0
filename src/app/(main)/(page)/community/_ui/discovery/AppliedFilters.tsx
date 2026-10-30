import { COMMUNITY_RECORD_LABELS, type CommunityExperienceConfig } from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { KIND_LABELS, MEDIA_LABELS, PERIOD_LABELS } from './constants'
import { categoryOf, keepCategory } from './categories'

export function AppliedFilters({
  value,
  config,
  onChange,
}: {
  value: CommunityDiscoveryFilters
  config: CommunityExperienceConfig
  onChange: (value: CommunityDiscoveryFilters) => void
}) {
  const patch = (next: Partial<CommunityDiscoveryFilters>) => onChange({ ...value, ...next })
  // [refactored] 값 하나짜리 조건(기록·글 성격·자료·시기)의 칩을 같은 모양으로 만든다 — 값이 없으면 칩도 없다
  const single = (key: 'record' | 'kind' | 'media' | 'period', label: string | undefined) =>
    label ? [{ key, label, clear: () => patch({ [key]: undefined }) }] : []
  // 카테고리·말머리는 위 줄에 이미 보이므로 여기서는 세부 조건만 보여 준다.
  // 주제는 한 카테고리로 묶이지 않을 때(카드에서 고른 '질문·답변', 예전 링크)만 칩으로 남긴다
  const topics = categoryOf(value) ? [] : (value.topics ?? [])
  const items = [
    ...single('record', value.record && COMMUNITY_RECORD_LABELS[value.record]),
    ...topics.map((topic) => ({
      key: `topic-${topic}`,
      label: config.topics.find((item) => item.key === topic)?.label ?? topic,
      clear: () => patch({ topics: value.topics?.filter((item) => item !== topic) }),
    })),
    ...(value.tags ?? []).map((tag) => ({
      key: `tag-${tag}`,
      label: `#${tag}`,
      clear: () => patch({ tags: value.tags?.filter((item) => item !== tag) }),
    })),
    // 예전 상세 필터로 만든 '경험·후기' 링크만 여기 남는다 (질문은 카테고리)
    ...single('kind', value.kind === 'story' ? KIND_LABELS.story : undefined),
    ...single('media', value.media && MEDIA_LABELS[value.media]),
    ...single('period', value.period && PERIOD_LABELS[value.period]),
  ]
  if (!items.length) return null
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="선택한 조건">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-label={`${item.label} 필터 해제`}
          onClick={item.clear}
          className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-lg bg-secondary-100 px-2.5 text-xs font-medium text-primary-700 focus-ring hover:bg-secondary-200"
        >
          <span className="truncate">{item.label}</span>
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(keepCategory(value))}
        className="min-h-8 px-2 text-xs font-medium text-neutral-700 underline focus-ring"
      >
        필터 초기화
      </button>
    </div>
  )
}
