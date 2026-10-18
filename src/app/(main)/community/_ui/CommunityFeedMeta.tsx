'use client'

import {
  CommunityPixelIcon,
  summarizeCommunityRecords,
  type CommunityExperience,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'

// 목록 위 필터 칩과 헷갈리지 않게 테두리·배경 없는 글자 링크로 둔다 (누르면 같은 조건으로 거른다)
const LINK =
  'relative inline-flex min-h-8 max-w-full items-center gap-1.5 text-xs focus-ring touch-target hover:underline'

/** 피드 카드의 기록·주제·태그 줄 — 누르면 같은 조건의 글만 모아 본다. */
export function CommunityFeedMeta({
  experience,
  topicLabel,
  onFilter,
}: {
  experience?: CommunityExperience | null
  topicLabel: (key: string) => string
  onFilter: (filters: CommunityDiscoveryFilters) => void
}) {
  if (!experience) return null
  const records = summarizeCommunityRecords(experience)
  const topics = experience.topics.slice(0, 3)
  const tags = (experience.tags ?? []).slice(0, 3)
  if (!records.length && !topics.length && !tags.length) return null
  return (
    <ul className="flex flex-wrap items-center gap-x-3" aria-label="이야기 정보">
      {records.map((record) => {
        // 카드에서는 날짜 대신 눈에 띄는 값 두 개만 보여 준다.
        const facts = record.facts
          .filter((fact) => !['활동', '방문 목적', '병원'].includes(fact.label))
          .slice(0, 2)
          .map((fact) => fact.value)
        const lead =
          record.kind === 'walk'
            ? record.title
            : (record.facts.find((fact) => ['방문 목적', '활동'].includes(fact.label))?.value ??
              record.title)
        return (
          <li key={record.kind} className="max-w-full">
            <button
              type="button"
              aria-label={`${record.title} 글만 보기`}
              onClick={() => onFilter({ record: record.kind })}
              className={`${LINK} font-semibold text-primary-700`}
            >
              <CommunityPixelIcon name={record.kind} className="text-primary-500" />
              <span className="truncate">{[lead, ...facts].join(' · ')}</span>
            </button>
          </li>
        )
      })}
      {topics.map((topic) => (
        <li key={`topic-${topic}`}>
          <button
            type="button"
            aria-label={`${topicLabel(topic)} 주제 글만 보기`}
            onClick={() => onFilter({ topics: [topic] })}
            className={`${LINK} font-medium text-neutral-700`}
          >
            {topicLabel(topic)}
          </button>
        </li>
      ))}
      {tags.map((tag) => (
        <li key={`tag-${tag}`}>
          <button
            type="button"
            aria-label={`${tag} 태그 글만 보기`}
            onClick={() => onFilter({ tags: [tag] })}
            className={`${LINK} font-medium text-primary-700`}
          >
            #{tag}
          </button>
        </li>
      ))}
    </ul>
  )
}
