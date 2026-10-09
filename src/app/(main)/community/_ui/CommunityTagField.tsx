'use client'

import { useId, useState } from 'react'
import { COMMUNITY_MAX_TAGS, CommunityPixelIcon, toCommunityTag } from '@/entities/community'

/** 직접 붙이는 태그 — Enter·쉼표로 넣고 칩의 ×로 뺀다. */
export function CommunityTagField({
  value,
  onChange,
  disabled,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const full = value.length >= COMMUNITY_MAX_TAGS

  const commit = (raw: string) => {
    const pieces = raw.split(',').filter((piece) => piece.trim())
    if (!pieces.length) return
    const next = [...value]
    let message = ''
    for (const piece of pieces) {
      const tag = toCommunityTag(piece)
      if (!tag) message = '태그는 한글·영문·숫자로 20자까지 쓸 수 있어요.'
      else if (next.includes(tag)) message = '이미 넣은 태그예요.'
      else if (next.length >= COMMUNITY_MAX_TAGS)
        message = `태그는 ${COMMUNITY_MAX_TAGS}개까지 넣을 수 있어요.`
      else next.push(tag)
    }
    if (next.length !== value.length) onChange(next)
    setError(message)
    setDraft('')
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-neutral-850">
          <CommunityPixelIcon name="tag" className="text-primary-500" />
          태그
        </label>
        <span className="text-xs font-medium text-neutral-700">
          {value.length}/{COMMUNITY_MAX_TAGS}
        </span>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="넣은 태그">
          {value.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                disabled={disabled}
                aria-label={`${tag} 태그 빼기`}
                onClick={() => {
                  onChange(value.filter((item) => item !== tag))
                  setError('')
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary-300 bg-white px-3 text-sm font-semibold text-primary-700 focus-ring hover:bg-primary-50"
              >
                #{tag}
                <span aria-hidden className="text-base leading-none text-neutral-700">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          value={draft}
          disabled={disabled || full}
          maxLength={60}
          enterKeyHint="done"
          autoComplete="off"
          aria-describedby={`${id}-hint`}
          aria-invalid={error ? true : undefined}
          placeholder={full ? '태그를 모두 채웠어요' : '예: 노령견, 제주 동반여행'}
          onChange={(event) => {
            const next = event.target.value
            if (next.includes(',')) commit(next)
            else {
              setDraft(next)
              if (error) setError('')
            }
          }}
          onKeyDown={(event) => {
            // 한글 조합 중 Enter는 글자 확정이므로 태그로 넣지 않는다.
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              commit(draft)
            }
            if (event.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={() => commit(draft)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base focus-ring disabled:bg-neutral-50 tab:text-sm"
        />
        <button
          type="button"
          disabled={disabled || full || !draft.trim()}
          onClick={() => commit(draft)}
          className="min-h-11 shrink-0 rounded-lg border border-primary-500 bg-white px-4 text-sm font-bold text-primary-700 focus-ring hover:bg-primary-50 disabled:border-neutral-200 disabled:text-neutral-400"
        >
          넣기
        </button>
      </div>
      <p id={`${id}-hint`} className="mt-2 text-xs leading-relaxed text-neutral-700">
        Enter나 쉼표로 넣어요. 이름·전화번호·집 주소는 적지 마세요.
      </p>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
