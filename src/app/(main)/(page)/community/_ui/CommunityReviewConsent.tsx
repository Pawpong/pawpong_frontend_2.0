'use client'

import { useId, useState } from 'react'
import { InfoLineIcon } from '@/shared/assets'
import { Checkbox } from '@/shared/ui/Checkbox'
import { IconButton } from '@/shared/ui/IconButton'
import type { CommunityReviewConfig } from '@/shared/types'

/** 올리기 바로 위 AI 처리 동의 한 줄 — 자세한 안내는 옆 안내 아이콘을 눌러 편다. */
export function CommunityReviewConsent({
  config,
  consent,
  onChange,
  disabled,
}: {
  config: CommunityReviewConfig
  consent: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  const [noticeOpen, setNoticeOpen] = useState(false)
  const id = useId()

  return (
    <section aria-label="AI 공개 심사 동의" className="text-body-sm text-neutral-700">
      <div className="flex items-center gap-1">
        <Checkbox
          id={`${id}-consent`}
          size="medium"
          checked={consent}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <label htmlFor={`${id}-consent`} className="text-xs font-medium text-neutral-850">
          본문·주제·태그·첨부 사진의 AI 처리에 동의합니다
        </label>
        <IconButton
          size="fit"
          tone="muted"
          aria-label="AI 처리 안내"
          aria-expanded={noticeOpen}
          aria-controls={`${id}-notice`}
          onClick={() => setNoticeOpen(!noticeOpen)}
        >
          <InfoLineIcon className="size-4" />
        </IconButton>
      </div>
      <div
        id={`${id}-notice`}
        hidden={!noticeOpen}
        className="mt-2 space-y-2 rounded-lg bg-neutral-100 p-3"
      >
        <p>동의하지 않아도 저장할 수 있지만 공개는 보류되고 나만 볼 수 있어요.</p>
        <p>{config.notice}</p>
        <p>
          승인되어도 선택한 공개 범위만 적용해요. 임시저장은 심사하지 않으며 하루 최대{' '}
          {config.dailyLimit}회예요. 실패한 요청도 한도에 포함돼요. 개인정보와 비밀값은 올리지
          마세요.
        </p>
      </div>
    </section>
  )
}
