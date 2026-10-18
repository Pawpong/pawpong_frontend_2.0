'use client'

import { useState } from 'react'
import {
  COMMUNITY_MAX_TOPICS,
  communityToday,
  CommunityPixelIcon,
  EMPTY_COMMUNITY_EXPERIENCE,
  type CommunityExperience,
  type CommunityExperienceConfig,
} from '@/entities/community'
import { cn } from '@/shared/lib/cn'
import { ClinicRecordFields, LifeRecordFields, WalkRecordFields } from './CommunityRecordFields'
import { CommunityPlaceSearch } from './CommunityPlaceSearch'
import { COMMUNITY_CATEGORIES } from './discovery/categories'

/** 목록과 같은 분류를 탐색하되, 글에는 선택한 세부 주제만 저장한다. */
export function CommunityCategoryField({
  value,
  onChange,
  config,
  disabled,
  error,
}: {
  value?: CommunityExperience | null
  onChange: (value: CommunityExperience) => void
  config: CommunityExperienceConfig
  disabled: boolean
  error?: string | null
}) {
  const current = value ?? EMPTY_COMMUNITY_EXPERIENCE
  const [categoryKey, setCategoryKey] = useState(
    () =>
      (current.question
        ? 'question'
        : COMMUNITY_CATEGORIES.find((category) =>
            category.topics?.some((topic) => current.topics.includes(topic)),
          )?.key) ?? '',
  )
  const category = COMMUNITY_CATEGORIES.find((item) => item.key === categoryKey)
  const label = (key: string) => config.topics.find((topic) => topic.key === key)?.label ?? key
  const toggle = (key: string) => {
    const selected = current.topics.includes(key)
    if (!selected && current.topics.length >= COMMUNITY_MAX_TOPICS) return
    onChange({
      ...current,
      topics: selected ? current.topics.filter((topic) => topic !== key) : [...current.topics, key],
    })
  }
  const recordKind =
    categoryKey === 'clinic'
      ? 'clinic'
      : categoryKey === 'outing'
        ? 'walk'
        : categoryKey === 'daily'
          ? 'life'
          : undefined
  const [today] = useState(communityToday)
  const saveRecord = (patch: Partial<CommunityExperience>) => {
    const topic = patch.clinic ? 'clinic' : patch.walk ? 'walk' : patch.life ? 'daily' : undefined
    onChange({
      ...current,
      ...patch,
      topics:
        topic && !current.topics.includes(topic) && current.topics.length < COMMUNITY_MAX_TOPICS
          ? [...current.topics, topic]
          : current.topics,
    })
  }
  const removeRecord = (key: 'clinic' | 'walk' | 'life') => {
    const next = { ...current }
    delete next[key]
    onChange(next)
  }
  return (
    <fieldset disabled={disabled} className="mt-5 min-w-0 space-y-3">
      <legend className="text-body-md font-semibold">카테고리</legend>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary-50 p-1.5 tab:grid-cols-4">
        {COMMUNITY_CATEGORIES.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={categoryKey === item.key}
            onClick={() => setCategoryKey(item.key)}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-body-md focus-ring disabled:opacity-50',
              categoryKey === item.key
                ? 'bg-white font-semibold text-primary-700 shadow-sm'
                : 'text-neutral-700 hover:bg-white/60',
            )}
          >
            <CommunityPixelIcon name={item.icon} className="size-5 shrink-0" />
            {item.label}
          </button>
        ))}
      </div>
      {category ? (
        <div className="space-y-2" aria-label={`${category.label} 세부 주제`}>
          <p className="text-body-sm text-neutral-700">
            {category.label} <span aria-hidden>&gt;</span>{' '}
            {category.kind ? '질문으로 올리기' : '세부 주제 선택'}
          </p>
          {category.kind ? (
            <label className="flex min-h-11 items-center gap-2 text-body-md">
              <input
                type="checkbox"
                checked={current.question}
                onChange={(event) =>
                  onChange({
                    ...current,
                    question: event.target.checked,
                    topics: event.target.checked
                      ? current.topics
                      : current.topics.filter((topic) => topic !== 'question'),
                  })
                }
                className="size-4 accent-primary-700"
              />
              다른 보호자에게 질문하는 글이에요
            </label>
          ) : (
            <div className="flex flex-wrap gap-2">
              {category.topics
                ?.filter((key) => config.topics.some((topic) => topic.key === key))
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={current.topics.includes(key)}
                    onClick={() => toggle(key)}
                    disabled={
                      !current.topics.includes(key) && current.topics.length >= COMMUNITY_MAX_TOPICS
                    }
                    className={cn(
                      'min-h-11 rounded-lg border px-3 text-body-md focus-ring disabled:opacity-40',
                      current.topics.includes(key)
                        ? 'border-primary-500 bg-secondary-200 font-semibold text-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-700',
                    )}
                  >
                    {label(key)}
                  </button>
                ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-body-sm text-neutral-700">
          카테고리를 누른 뒤 세부 주제를 골라 주세요. 선택하지 않아도 글을 올릴 수 있어요.
        </p>
      )}
      {(current.topics.length > 0 || current.question) && (
        <div
          className="flex flex-wrap items-center gap-2 border-t border-neutral-150 pt-3"
          aria-label="선택한 주제"
        >
          <span className="text-body-sm text-neutral-700">
            선택 {current.topics.length}/{COMMUNITY_MAX_TOPICS}
          </span>
          {current.topics
            .filter((key) => key !== 'question')
            .map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-label={`${label(key)} 선택 해제`}
                className="min-h-11 rounded-lg bg-secondary-50 px-3 text-body-sm text-primary-700 focus-ring"
              >
                {label(key)} <span aria-hidden>×</span>
              </button>
            ))}
          {current.question && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...current,
                  question: false,
                  topics: current.topics.filter((key) => key !== 'question'),
                })
              }
              aria-label="질문 선택 해제"
              className="min-h-11 rounded-lg bg-secondary-50 px-3 text-body-sm text-primary-700 focus-ring"
            >
              질문 <span aria-hidden>×</span>
            </button>
          )}
        </div>
      )}
      {(recordKind || current.clinic || current.walk || current.life) && (
        <div className="space-y-3 border-t border-neutral-150 pt-4">
          <p className="text-body-sm text-neutral-700">
            카테고리에 맞는 기록을 함께 남길 수 있어요. 입력하지 않으면 기록 없이 게시돼요.
          </p>
          {(recordKind === 'clinic' || current.clinic) && (
            <div className="space-y-2">
              <ClinicRecordFields
                value={current.clinic ?? { visitedOn: today, clinicName: '', visitReason: 'other' }}
                onChange={(clinic) => saveRecord({ clinic })}
                search={
                  <CommunityPlaceSearch
                    label="병원 이름 찾아 채우기"
                    disabled={disabled}
                    onPick={(place) =>
                      saveRecord({
                        clinic: {
                          ...(current.clinic ?? {
                            visitedOn: today,
                            visitReason: 'other' as const,
                          }),
                          clinicName: place.name.slice(0, 80),
                        },
                      })
                    }
                  />
                }
              />
              {current.clinic && (
                <button
                  type="button"
                  onClick={() => removeRecord('clinic')}
                  className="min-h-11 text-body-sm text-neutral-700 underline focus-ring"
                >
                  병원 기록 지우기
                </button>
              )}
            </div>
          )}
          {(recordKind === 'walk' || current.walk) && (
            <div className="space-y-2">
              <WalkRecordFields
                value={current.walk ?? { walkedOn: today }}
                onChange={(walk) => saveRecord({ walk })}
              />
              {current.walk && (
                <button
                  type="button"
                  onClick={() => removeRecord('walk')}
                  className="min-h-11 text-body-sm text-neutral-700 underline focus-ring"
                >
                  산책 기록 지우기
                </button>
              )}
            </div>
          )}
          {(recordKind === 'life' || current.life) && (
            <div className="space-y-2">
              <LifeRecordFields
                value={current.life ?? { recordedOn: today, activity: 'other' }}
                onChange={(life) => saveRecord({ life })}
              />
              {current.life && (
                <button
                  type="button"
                  onClick={() => removeRecord('life')}
                  className="min-h-11 text-body-sm text-neutral-700 underline focus-ring"
                >
                  일상 기록 지우기
                </button>
              )}
            </div>
          )}
          {error && (
            <p role="status" className="text-body-sm text-primary-700">
              {error}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}
