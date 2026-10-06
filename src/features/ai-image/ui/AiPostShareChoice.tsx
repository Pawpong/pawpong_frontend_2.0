'use client'

export function AiPostShareChoice({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary-200 bg-point-50 p-4 text-sm leading-relaxed text-neutral-850">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 size-4 accent-primary-600"
      />
      <span>
        <span className="block font-semibold">원본과 AI 결과를 비교해서 공개하기</span>
        <span className="mt-1 block text-xs text-neutral-600">
          선택하면 원본 사진도 게시글에 올리고, 다른 사용자가 슬라이더로 비교할 수 있어요. 선택하지
          않으면 AI 결과만 올려요.
        </span>
      </span>
    </label>
  )
}
