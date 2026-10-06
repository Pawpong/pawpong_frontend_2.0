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
    <section
      className="space-y-3 rounded-xl border-2 border-primary-200 bg-point-50 p-4"
      aria-label="AI 공개 심사 동의"
    >
      <h3 className="text-sm font-bold">우리 이야기, 함께 나누기 전에</h3>
      <p className="text-xs leading-relaxed text-neutral-700">{config.notice}</p>
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
      <p className="text-xs leading-relaxed text-neutral-700">
        동의하지 않아도 저장할 수 있지만 공개는 보류돼요. 승인되어도 선택한 공개 범위만 적용해요.
        임시저장은 심사하지 않으며 하루 최대 {config.dailyLimit}회예요. 실패한 요청도 한도에
        포함돼요. 개인정보와 비밀값은 올리지 마세요.
      </p>
    </section>
  )
}
