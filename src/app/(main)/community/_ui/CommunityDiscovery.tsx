'use client'

import { useState } from 'react'
import {
  COMMUNITY_TOPIC_GROUPS,
  normalizeCommunityTags,
  type CommunityExperienceConfig,
} from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { cn } from '@/shared/lib/cn'

export function CommunityDiscovery({
  config,
  value,
  onChange,
}: {
  config: CommunityExperienceConfig
  value: CommunityDiscoveryFilters
  onChange: (value: CommunityDiscoveryFilters) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tagInput, setTagInput] = useState(value.tags?.join(', ') ?? '')
  const topics = value.topics ?? []
  const count =
    topics.length +
    (value.tags?.length ?? 0) +
    Number(!!value.kind) +
    Number(!!value.media) +
    Number(!!value.period)
  const patch = (next: Partial<CommunityDiscoveryFilters>) => onChange({ ...value, ...next })
  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-point-50 via-white to-emerald-50"
      aria-label="복합 경험 필터"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-primary-700">
            우리 아이에게 필요한 경험 찾기
          </p>
          <h2 className="mt-1 text-base font-bold">동물 종류부터 주제·장소·태그까지</h2>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm"
        >
          {expanded ? '필터 접기' : `상세 필터${count ? ` · ${count}개 적용` : ''}`}
        </button>
      </div>
      {count > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-primary-100 px-5 py-3">
          {topics.map((key) => (
            <button
              type="button"
              key={key}
              className="rounded-lg border border-primary-200 bg-white px-2 py-1 text-xs"
              aria-label={`${config.topics.find((topic) => topic.key === key)?.label ?? key} 필터 해제`}
              onClick={() => patch({ topics: topics.filter((topic) => topic !== key) })}
            >
              {config.topics.find((topic) => topic.key === key)?.label ?? key} ×
            </button>
          ))}
          {value.tags?.map((tag) => (
            <span key={tag} className="text-xs font-bold text-primary-700">
              #{tag}
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange({})
              setTagInput('')
            }}
            className="ml-auto text-xs underline"
          >
            모든 필터 초기화
          </button>
        </div>
      )}
      {expanded && (
        <div className="space-y-5 border-t border-primary-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-neutral-600">
              주제 최대 5개 · 모든 조건은 동물 종류·검색어와 함께 적용돼요.
            </p>
            <label className="text-xs">
              선택 주제{' '}
              <select
                aria-label="주제 일치 방식"
                value={value.topicMatch ?? 'any'}
                onChange={(event) =>
                  patch({ topicMatch: event.target.value === 'all' ? 'all' : 'any' })
                }
                className="ml-2 rounded border border-neutral-200 bg-white p-2"
              >
                <option value="any">하나라도 일치</option>
                <option value="all">모두 일치</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 tab:grid-cols-2">
            {COMMUNITY_TOPIC_GROUPS.map((group) => (
              <fieldset key={group.title} className="rounded-xl bg-white/80 p-3">
                <legend className="px-1 text-sm font-bold">{group.title}</legend>
                <div className="flex flex-wrap gap-2">
                  {group.keys.map((key) => {
                    const selected = topics.includes(key)
                    const topic = config.topics.find((topic) => topic.key === key)
                    return topic ? (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={selected}
                        disabled={!selected && topics.length >= 5}
                        onClick={() =>
                          patch({
                            topics: selected
                              ? topics.filter((topic) => topic !== key)
                              : [...topics, key],
                          })
                        }
                        className={cn(
                          'rounded-lg border px-3 py-2 text-xs disabled:opacity-40',
                          selected
                            ? 'border-primary-500 bg-point-100 font-bold text-primary-700'
                            : 'border-neutral-150 bg-white',
                        )}
                      >
                        {topic.label}
                      </button>
                    ) : null
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="grid gap-3 tab:grid-cols-3">
            <label className="text-xs font-bold">
              글 성격
              <select
                aria-label="글 성격 필터"
                value={value.kind ?? ''}
                onChange={(event) =>
                  patch({
                    kind:
                      event.target.value === 'question'
                        ? 'question'
                        : event.target.value === 'story'
                          ? 'story'
                          : undefined,
                  })
                }
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white p-3"
              >
                <option value="">질문과 경험 모두</option>
                <option value="question">질문·답변만</option>
                <option value="story">생활 경험·후기만</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              공유 자료
              <select
                aria-label="공유 자료 필터"
                value={value.media ?? ''}
                onChange={(event) =>
                  patch({
                    media:
                      event.target.value === 'map'
                        ? 'map'
                        : event.target.value === 'photos'
                          ? 'photos'
                          : undefined,
                  })
                }
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white p-3"
              >
                <option value="">모든 자료</option>
                <option value="photos">사진이 있는 글</option>
                <option value="map">지도·공개 장소가 있는 글</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              작성 시기
              <select
                aria-label="작성 시기 필터"
                value={value.period ?? ''}
                onChange={(event) =>
                  patch({
                    period:
                      event.target.value === 'week'
                        ? 'week'
                        : event.target.value === 'month'
                          ? 'month'
                          : undefined,
                  })
                }
                className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white p-3"
              >
                <option value="">전체 기간</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
              </select>
            </label>
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              patch({ tags: normalizeCommunityTags(tagInput) })
            }}
          >
            <label className="w-full text-xs font-bold" htmlFor="community-tag-filter">
              사용자 태그로 더 구체적으로 · 최대 5개, 쉼표로 구분
            </label>
            <input
              id="community-tag-filter"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              maxLength={120}
              placeholder="노령견, 슬개골, 제주 동반여행"
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white p-3 text-sm"
            />
            <button type="submit" className="rounded-lg bg-primary-500 px-4 text-sm font-bold">
              태그 적용
            </button>
            <p className="w-full text-xs text-neutral-600">
              입력한 태그가 모두 포함된 글을 찾아요. 진료 경험은 의료 자격이나 병원 평가 인증이
              아니에요.
            </p>
          </form>
        </div>
      )}
    </section>
  )
}
