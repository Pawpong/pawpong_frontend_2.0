'use client'

import { useId, useState } from 'react'
import { COMMUNITY_MAX_TAGS, toCommunityTag } from '@/entities/community'
import { Input } from '@/shared/ui'

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
      <label htmlFor={id} className="sr-only">
        태그 추가
      </label>
      <div className="flex flex-wrap items-center gap-x-4">
        {value.length > 0 && (
          <ul className="flex max-w-full flex-wrap gap-x-4" aria-label="넣은 태그">
            {value.map((tag) => (
              <li key={tag} className="max-w-full min-w-0">
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${tag} 태그 빼기`}
                  onClick={() => {
                    onChange(value.filter((item) => item !== tag))
                    setError('')
                  }}
                  className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded text-body-md font-medium text-primary-700 focus-ring transition-colors hover:text-primary-500 disabled:opacity-50"
                >
                  <span className="min-w-0 break-all">#{tag}</span>
                  <span aria-hidden className="shrink-0 text-body-md text-neutral-700">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="min-w-0 flex-1 basis-32">
          <Input
            variant="composer"
            id={id}
            value={draft}
            disabled={disabled || full}
            maxLength={60}
            enterKeyHint="done"
            autoComplete="off"
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
            aria-invalid={error ? true : undefined}
            placeholder={full ? `태그 ${COMMUNITY_MAX_TAGS}개 추가됨` : '# 태그 추가'}
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
          />
        </div>
      </div>
      <p id={`${id}-hint`} className="sr-only">
        {/* [refactored] 개수 한도는 상수에서 */}
        Enter 또는 쉼표로 추가 · 태그당 20자, 최대 {COMMUNITY_MAX_TAGS}개
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-body-sm text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
