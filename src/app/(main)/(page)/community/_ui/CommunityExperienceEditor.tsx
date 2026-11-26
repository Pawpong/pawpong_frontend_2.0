'use client'

import {
  COMMUNITY_MAX_ROUTE_POINTS,
  COMMUNITY_TEMPLATES,
  EMPTY_COMMUNITY_EXPERIENCE,
  isCommunityTemplateActive,
  type CommunityExperience,
} from '@/entities/community'
import type { CommunityPhotoLocationOption } from '@/features/community'
import { CommunityRoutePicker } from './CommunityRoutePicker'
import { CommunityTagField } from './CommunityTagField'
import { Badge, Button, Sheet } from '@/shared/ui'

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

/**
 * 다녀온 장소 연결 시트 (A2) — 하단 도구 모음 '장소'에서 화면을 떠나지 않고 연다.
 * 장소 유형·검색·지도·담은 순서·공개 장소 확인은 CommunityRoutePicker 가 그대로 맡는다.
 * 담은 장소는 바로 글에 반영되고, 아래 버튼은 시트를 닫기만 한다.
 */
export function CommunityPlaceSheet({
  open,
  onOpenChange,
  value,
  onChange,
  disabled,
  error,
  photos = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: CommunityExperience | null
  onChange: (value: CommunityExperience) => void
  disabled: boolean
  /** 저장하려면 마저 채워야 하는 칸 안내 (공개 장소 확인 등) */
  error?: string | null
  photos?: CommunityPhotoLocationOption[]
}) {
  const current = value ?? EMPTY_COMMUNITY_EXPERIENCE
  const count = current.route.length
  const wantsPlace = COMMUNITY_TEMPLATES.some(
    (template) =>
      ['walk', 'travel'].includes(template.key) && isCommunityTemplateActive(current, template),
  )

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="다녀온 장소 연결"
      badge={<Badge variant="primarySoft">최대 {COMMUNITY_MAX_ROUTE_POINTS}곳</Badge>}
      footer={
        <Button size="lg" width="full" onClick={() => onOpenChange(false)}>
          완료
        </Button>
      }
    >
      <fieldset disabled={disabled} className="min-w-0 space-y-3">
        <legend className="sr-only">다녀온 장소</legend>
        {count === 0 && (
          <p className="text-xs leading-relaxed text-neutral-700">
            {wantsPlace
              ? '다녀온 장소를 지도에 담으면 다른 보호자가 찾아가 보기 쉬워요. 사진 위치는 확인한 것만 담겨요.'
              : '함께 가 볼 만한 공개 장소가 있다면 지도에 담아 보세요.'}
          </p>
        )}
        <CommunityRoutePicker
          value={current}
          onChange={(patch) => onChange({ ...current, ...patch })}
          disabled={disabled}
          photos={photos}
        />
        {error && count > 0 && (
          <p role="status" className="text-body-sm text-primary-700">
            {error}
          </p>
        )}
        <p className="text-xs leading-relaxed text-neutral-700">
          보호자의 이름·전화번호·진료기록 같은 개인정보는 사진과 글에서 가려 주세요.
        </p>
      </fieldset>
    </Sheet>
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
