'use client'

import { useState } from 'react'
import {
  COMMUNITY_TEMPLATES,
  CommunityPixelIcon,
  EMPTY_COMMUNITY_EXPERIENCE,
  isCommunityTemplateActive,
  type CommunityExperience,
  type CommunityExperienceConfig,
} from '@/entities/community'
import type { CommunityPhotoLocationOption } from '@/features/community'
import { CommunityRoutePicker } from './CommunityRoutePicker'
import { CommunityTagField } from './CommunityTagField'

/** on: 올릴 때 자동으로 붙음 · consent: 동의하면 붙음 · off: 지금은 쓸 수 없음 */
export type CommunityAutoTagging = 'on' | 'consent' | 'off'

const AUTO_TAG_COPY: Record<CommunityAutoTagging, { title: string; body: string }> = {
  on: {
    title: '올리면 주제와 태그가 자동으로 붙어요',
    body: '포퐁 AI가 글과 사진을 읽고 바로 붙여요. 따로 확인하는 단계는 없고, 붙은 뒤에는 글 수정에서 빼거나 바꿀 수 있고, 뺀 태그는 다시 붙지 않아요.',
  },
  consent: {
    title: 'AI 처리에 동의하면 자동으로 붙어요',
    body: '게시 전 확인에서 동의하면 올릴 때 포퐁 AI가 주제와 태그를 붙여요. 동의하지 않으면 직접 고른 것만 저장돼요.',
  },
  off: {
    title: '지금은 자동 태그를 쓸 수 없어요',
    body: '직접 고른 주제와 태그만 저장돼요.',
  },
}

export function CommunityExperienceEditor({
  value,
  onChange,
  disabled,
  error,
  photos = [],
}: {
  value?: CommunityExperience | null
  onChange: (value: CommunityExperience) => void
  config: CommunityExperienceConfig
  disabled: boolean
  /** 저장하려면 마저 채워야 하는 기록 칸 안내 */
  error?: string | null
  photos?: CommunityPhotoLocationOption[]
}) {
  const current = value ?? EMPTY_COMMUNITY_EXPERIENCE
  const update = (patch: Partial<CommunityExperience>) => onChange({ ...current, ...patch })
  const wantsPlace = COMMUNITY_TEMPLATES.some(
    (template) =>
      ['walk', 'travel'].includes(template.key) && isCommunityTemplateActive(current, template),
  )
  const [placeOpen, setPlaceOpen] = useState(current.route.length > 0)
  const showPlace = placeOpen || current.route.length > 0 || photos.some((photo) => photo.location)

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-4 border-t border-neutral-150 pt-4">
      <legend className="sr-only">이야기 종류와 기록</legend>

      <details open={current.route.length > 0 || undefined}>
        <summary className="flex min-h-11 cursor-pointer items-center justify-between text-body-md font-medium focus-ring">
          장소 추가 <span aria-hidden>＋</span>
        </summary>
        <div className="mt-3">
          <section aria-label="다녀온 장소 연결">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-850">
                <CommunityPixelIcon name="travel" className="text-primary-500" />
                다녀온 장소 연결 {current.route.length > 0 && `· ${current.route.length}곳`}
              </h3>
              {current.route.length === 0 && (
                <button
                  type="button"
                  aria-expanded={showPlace}
                  onClick={() => setPlaceOpen(!placeOpen)}
                  className="touch-target relative min-h-9 rounded-lg px-2 text-sm font-semibold text-primary-700 underline focus-ring"
                >
                  {showPlace ? '지도 접기' : '지도에서 담기'}
                </button>
              )}
            </div>
            {showPlace ? (
              <div className="mt-3">
                <CommunityRoutePicker
                  value={current}
                  onChange={update}
                  disabled={disabled}
                  photos={photos}
                />
              </div>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-neutral-700">
                {wantsPlace
                  ? '다녀온 장소를 지도에 담으면 다른 보호자가 찾아가 보기 쉬워요. 사진 위치는 확인한 것만 담겨요.'
                  : '함께 가 볼 만한 공개 장소가 있다면 지도에 담아 보세요.'}
              </p>
            )}
          </section>
        </div>
      </details>
      {error && current.route.length > 0 && (
        <p role="status" className="text-body-sm text-primary-700">
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-neutral-700">
        보호자의 이름·전화번호·진료기록 같은 개인정보는 사진과 글에서 가려 주세요.
      </p>
    </fieldset>
  )
}

/** 본문·사진과 함께 항상 노출하는 태그 입력. */
export function CommunityEditorTags({
  value,
  onChange,
  disabled,
  autoTagging,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  disabled: boolean
  autoTagging: CommunityAutoTagging
}) {
  const copy = AUTO_TAG_COPY[autoTagging]
  return (
    <section aria-label="태그 입력" className="mt-5 space-y-3">
      <CommunityTagField value={value} onChange={onChange} disabled={disabled} />
      {autoTagging !== 'off' && (
        <details className="text-body-sm text-neutral-700">
          <summary className="w-fit cursor-pointer rounded focus-ring">{copy.title}</summary>
          <p className="mt-2">{copy.body}</p>
        </details>
      )}
    </section>
  )
}
