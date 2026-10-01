'use client'

import { PawPrintIcon } from '@/shared/assets'
import { Button, Chip } from '@/shared/ui'
import type { CommunityPetType } from '@/shared/types'
import { usePetCategorySuggestion } from '../lib/usePetCategorySuggestion'

const OPTIONS: { value: CommunityPetType; label: string }[] = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
  { value: 'reptile', label: '파충류' },
]

interface Props {
  text: string
  photo?: File
  value: CommunityPetType | ''
  onChange: (value: CommunityPetType | '') => void
  disabled?: boolean
}

export function PetCategorySuggestion({ text, photo, value, onChange, disabled }: Props) {
  const { state, request, dismiss } = usePetCategorySuggestion(text, photo)
  const suggestion =
    state?.result?.subject === 'animal'
      ? OPTIONS.find((option) => option.value === state.result?.petType)
      : undefined
  const choose = (next: CommunityPetType | '') => {
    dismiss()
    onChange(next)
  }

  return (
    <fieldset className="rounded-xl bg-neutral-50 p-5" disabled={disabled}>
      <legend className="sr-only">이야기 카테고리</legend>
      <h3 className="text-sm font-semibold">어떤 아이 이야기인가요?</h3>
      {!value && (
        <div className="mt-3 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-850">
            <PawPrintIcon aria-hidden className="size-4 text-primary-500" />
            포퐁 AI의 작은 도움
          </div>
          <div aria-live="polite" className="mt-2 text-sm leading-relaxed text-neutral-700">
            {state?.phase === 'loading' ? (
              <p role="status">어떤 아이의 이야기인지 살펴보고 있어요…</p>
            ) : suggestion ? (
              <>
                <p>
                  <strong className="text-neutral-850">{suggestion.label} 이야기</strong>인 것
                  같아요. 이 카테고리로 할까요?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => choose(suggestion.value)}>
                    네, {suggestion.label} 이야기예요
                  </Button>
                  <Button type="button" size="sm" intent="ghost" onClick={dismiss}>
                    직접 고를게요
                  </Button>
                </div>
              </>
            ) : state?.phase === 'done' ? (
              <p>어떤 아이인지 딱 정하기 어렵네요. 아래에서 직접 골라 주세요.</p>
            ) : state?.phase === 'error' ? (
              <p>지금은 AI 추천을 불러오지 못했어요. 아래에서 직접 고를 수 있어요.</p>
            ) : (
              <p>사진과 이야기를 보고 어울리는 카테고리를 추천해 드릴게요.</p>
            )}
          </div>
          {!suggestion && state?.phase !== 'loading' && (
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                disabled={!text.trim() && !photo}
                onClick={() => void request()}
              >
                {state ? '다시 추천받기' : 'AI 추천받기'}
              </Button>
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-neutral-600">
            추천받기를 누르면 글 앞부분과 새로 올린 첫 사진의 축소본을 OpenAI에 보내요. 원하지
            않으면 직접 고르면 돼요. 연락처 등 개인정보는 빼 주세요.
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={value === option.value}
            disabled={disabled}
            onClick={() => choose(value === option.value ? '' : option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-700">
        직접 골라도 좋아요. 선택하지 않으면 전체 이야기에 올라가요.
      </p>
    </fieldset>
  )
}
