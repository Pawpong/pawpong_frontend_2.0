import type { CommunityReviewConfig } from '@/shared/types'

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
  return (
    <section className="space-y-3 border-t border-neutral-150 pt-5" aria-label="AI 공개 심사 동의">
      <h3 className="text-sm font-bold">게시 전 확인</h3>

      <label className="flex items-start gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={consent}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-primary-700"
        />
        본문·주제·태그·첨부 사진의 AI 처리에 동의합니다.
      </label>
      <p className="text-body-sm text-neutral-700">
        동의하지 않아도 저장할 수 있지만 공개는 보류돼요.
      </p>
      <details className="text-body-sm text-neutral-700">
        <summary className="w-fit cursor-pointer rounded focus-ring">AI 처리 · 심사 안내</summary>
        <p className="mt-2">{config.notice}</p>
        <p className="mt-2">
          승인되어도 선택한 공개 범위만 적용해요. 임시저장은 심사하지 않으며 하루 최대{' '}
          {config.dailyLimit}회예요. 실패한 요청도 한도에 포함돼요. 개인정보와 비밀값은 올리지
          마세요.
        </p>
      </details>
    </section>
  )
}
