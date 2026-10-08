import { COMMUNITY_RECORD_LABELS, type CommunityExperienceConfig } from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { KIND_LABELS, MEDIA_LABELS, PERIOD_LABELS } from './constants'

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
  const items = [
    ...(value.record
      ? [
          {
            key: 'record',
            label: COMMUNITY_RECORD_LABELS[value.record],
            clear: () => patch({ record: undefined }),
          },
        ]
      : []),
    ...(value.topics ?? []).map((topic) => ({
      key: `topic-${topic}`,
      label: config.topics.find((item) => item.key === topic)?.label ?? topic,
      clear: () => patch({ topics: value.topics?.filter((item) => item !== topic) }),
    })),
    ...(value.tags ?? []).map((tag) => ({
      key: `tag-${tag}`,
      label: `#${tag}`,
      clear: () => patch({ tags: value.tags?.filter((item) => item !== tag) }),
    })),
    ...(value.kind
      ? [{ key: 'kind', label: KIND_LABELS[value.kind], clear: () => patch({ kind: undefined }) }]
      : []),
    ...(value.media
      ? [
          {
            key: 'media',
            label: MEDIA_LABELS[value.media],
            clear: () => patch({ media: undefined }),
          },
        ]
      : []),
    ...(value.period
      ? [
          {
            key: 'period',
            label: PERIOD_LABELS[value.period],
            clear: () => patch({ period: undefined }),
          },
        ]
      : []),
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
        onClick={() => onChange({})}
        className="min-h-8 px-2 text-xs font-medium text-neutral-600 underline focus-ring"
      >
        필터 초기화
      </button>
    </div>
  )
}
