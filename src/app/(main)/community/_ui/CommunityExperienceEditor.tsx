'use client'

import { useState } from 'react'
import {
  COMMUNITY_MAX_TOPICS,
  COMMUNITY_TEMPLATES,
  COMMUNITY_TOPIC_GROUPS,
  CommunityPixelIcon,
  EMPTY_COMMUNITY_EXPERIENCE,
  isCommunityTemplateActive,
  toggleCommunityTemplate,
  type CommunityExperience,
  type CommunityExperienceConfig,
} from '@/entities/community'
import { cn } from '@/shared/lib/cn'
import { CommunityClinicSearch } from './CommunityClinicSearch'
import { ClinicRecordFields, LifeRecordFields, WalkRecordFields } from './CommunityRecordFields'
import { CommunityRoutePicker } from './CommunityRoutePicker'
import { CommunityTagField } from './CommunityTagField'

/** on: 올릴 때 자동으로 붙음 · consent: 동의하면 붙음 · off: 지금은 쓸 수 없음 */
export type CommunityAutoTagging = 'on' | 'consent' | 'off'

const AUTO_TAG_COPY: Record<CommunityAutoTagging, { title: string; body: string }> = {
  on: {
    title: '올리면 주제와 태그가 자동으로 붙어요',
    body: '포퐁 AI가 글과 사진을 읽고 바로 붙여요. 따로 확인하는 단계는 없고, 붙은 뒤에는 글 수정에서 빼거나 바꿀 수 있어요.',
  },
  consent: {
    title: 'AI 처리에 동의하면 자동으로 붙어요',
    body: '위에서 동의하면 올릴 때 포퐁 AI가 주제와 태그를 붙여요. 동의하지 않으면 직접 고른 것만 저장돼요.',
  },
  off: {
    title: '지금은 자동 태그를 쓸 수 없어요',
    body: '직접 고른 주제와 태그만 저장돼요.',
  },
}

export function CommunityExperienceEditor({
  value,
  onChange,
  config,
  disabled,
  autoTagging,
  error,
}: {
  value?: CommunityExperience | null
  onChange: (value: CommunityExperience) => void
  config: CommunityExperienceConfig
  disabled: boolean
  autoTagging: CommunityAutoTagging
  /** 저장하려면 마저 채워야 하는 기록 칸 안내 */
  error?: string | null
}) {
  const current = value ?? EMPTY_COMMUNITY_EXPERIENCE
  const update = (patch: Partial<CommunityExperience>) => onChange({ ...current, ...patch })
  const wantsPlace = COMMUNITY_TEMPLATES.some(
    (template) =>
      ['walk', 'travel'].includes(template.key) && isCommunityTemplateActive(current, template),
  )
  const [placeOpen, setPlaceOpen] = useState(current.route.length > 0)
  const showPlace = placeOpen || current.route.length > 0
  const label = (key: string) => config.topics.find((topic) => topic.key === key)?.label
  const autoCopy = AUTO_TAG_COPY[autoTagging]

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 space-y-6 rounded-2xl border border-primary-200 bg-secondary-50 p-4 tab:p-5"
    >
      <legend className="sr-only">이야기 종류와 기록</legend>

      <div>
        <h3 className="font-cafe24 text-base text-primary-700">어떤 이야기인가요?</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-700">
          고르면 알맞은 기록 칸이 열려요. 여러 개를 함께 골라도 되고, 고르지 않아도 올릴 수 있어요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 tab:grid-cols-3">
          {COMMUNITY_TEMPLATES.map((template) => {
            const selected = isCommunityTemplateActive(current, template)
            return (
              <button
                key={template.key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onChange(toggleCommunityTemplate(current, template))
                  if (!selected && ['walk', 'travel'].includes(template.key)) setPlaceOpen(true)
                }}
                className={cn(
                  'flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-xl border-2 px-3 py-2 text-left focus-ring transition-colors',
                  selected
                    ? 'border-primary-500 bg-secondary-200'
                    : 'border-primary-100 bg-white hover:border-primary-300',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-primary-700">
                  <CommunityPixelIcon name={template.key} className="text-primary-500" />
                  {template.label}
                </span>
                <span className="text-xs text-neutral-700">{template.hint}</span>
              </button>
            )
          })}
        </div>
        {current.question && config.aiEnabled && (
          <p className="mt-2 text-xs leading-relaxed text-neutral-700">
            질문으로 올리면 게시한 뒤 내 글에서 AI 참고 답변을 요청할 수 있어요.
          </p>
        )}
      </div>

      {current.walk && (
        <WalkRecordFields value={current.walk} onChange={(walk) => update({ walk })} />
      )}
      {current.clinic && (
        <ClinicRecordFields
          value={current.clinic}
          onChange={(clinic) => update({ clinic })}
          search={
            <CommunityClinicSearch
              label="병원 이름 찾아 채우기"
              disabled={disabled}
              onPick={(place) =>
                current.clinic &&
                update({ clinic: { ...current.clinic, clinicName: place.name.slice(0, 80) } })
              }
            />
          }
        />
      )}
      {current.life && (
        <LifeRecordFields value={current.life} onChange={(life) => update({ life })} />
      )}

      {error && (
        <p
          role="status"
          className="rounded-lg border border-primary-200 bg-white p-3 text-sm font-semibold text-primary-700"
        >
          {error}
        </p>
      )}

      <section aria-label="산책 코스와 방문 장소">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-850">
            <CommunityPixelIcon name="travel" className="text-primary-500" />
            코스·장소 {current.route.length > 0 && `· ${current.route.length}곳`}
          </h3>
          {current.route.length === 0 && (
            <button
              type="button"
              aria-expanded={showPlace}
              onClick={() => setPlaceOpen(!placeOpen)}
              className="min-h-9 rounded-lg px-2 text-sm font-semibold text-primary-700 underline focus-ring"
            >
              {showPlace ? '지도 접기' : '지도에서 담기'}
            </button>
          )}
        </div>
        {showPlace ? (
          <div className="mt-3">
            <CommunityRoutePicker value={current} onChange={update} disabled={disabled} />
          </div>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-neutral-700">
            {wantsPlace
              ? '다녀온 코스를 지도에 담으면 다른 보호자가 따라가 보기 쉬워요.'
              : '함께 가 볼 만한 공개 장소가 있다면 지도에 담아 보세요.'}
          </p>
        )}
      </section>

      <section aria-label="주제와 태그" className="space-y-4">
        <div className="rounded-xl border border-secondary-400 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-primary-700">
            <CommunityPixelIcon name="tag" className="text-secondary-600" />
            {autoCopy.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-700">{autoCopy.body}</p>
        </div>

        <CommunityTagField
          value={current.tags ?? []}
          onChange={(tags) => update({ tags })}
          disabled={disabled}
        />

        <details className="group rounded-xl bg-white">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 text-sm font-bold text-neutral-850 focus-ring [&::-webkit-details-marker]:hidden">
            <span>
              주제 직접 고르기{' '}
              <span className="font-medium text-neutral-600">
                {current.topics.length}/{COMMUNITY_MAX_TOPICS}
              </span>
            </span>
            <span
              aria-hidden
              className="text-neutral-500 transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <div className="space-y-4 px-4 pb-4">
            {COMMUNITY_TOPIC_GROUPS.map((group) => {
              const keys = group.keys.filter((key) => label(key))
              if (!keys.length) return null
              return (
                <fieldset key={group.title}>
                  <legend className="mb-2 text-xs font-bold text-neutral-700">{group.title}</legend>
                  <div className="flex flex-wrap gap-2">
                    {keys.map((key) => {
                      const selected = current.topics.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={selected}
                          disabled={!selected && current.topics.length >= COMMUNITY_MAX_TOPICS}
                          onClick={() =>
                            update({
                              ...(key === 'question' ? { question: !selected } : {}),
                              topics: selected
                                ? current.topics.filter((topic) => topic !== key)
                                : [...current.topics, key],
                            })
                          }
                          className={cn(
                            'min-h-9 rounded-full border px-3 text-sm focus-ring transition-colors disabled:opacity-40',
                            selected
                              ? 'border-primary-500 bg-secondary-200 font-bold text-primary-700'
                              : 'border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-secondary-50',
                          )}
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
        </details>
      </section>

      <p className="text-xs leading-relaxed text-neutral-700">
        보호자의 이름·전화번호·진료기록 같은 개인정보는 사진과 글에서 가려 주세요.
      </p>
    </fieldset>
  )
}
