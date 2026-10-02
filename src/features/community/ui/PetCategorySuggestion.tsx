'use client'

import { useEffect, useState } from 'react'
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
  // 수정 화면의 기존 분류와 사용자가 직접 고른 분류는 자동 결과로 덮어쓰지 않는다.
  const [manual, setManual] = useState(() => Boolean(value))
  const { state, retry, dismiss } = usePetCategorySuggestion(text, photo, !manual && !disabled)
  const suggestion =
    state?.result?.subject === 'animal'
      ? OPTIONS.find((option) => option.value === state.result?.petType)
      : undefined

  useEffect(() => {
    if (manual || disabled) return
    const next = suggestion?.value ?? ''
    if (next !== value) onChange(next)
  }, [manual, disabled, suggestion?.value, value, onChange])

  const choose = (next: CommunityPetType | '') => {
    dismiss()
    setManual(true)
    onChange(next)
  }

  return (
    <fieldset className="rounded-xl bg-neutral-50 p-5" disabled={disabled}>
      <legend className="sr-only">이야기 카테고리</legend>
      <h3 className="text-sm font-semibold">어떤 아이 이야기인가요?</h3>
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
      <div className="mt-3 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-850">
          <PawPrintIcon aria-hidden className="size-4 text-primary-500" />
          포퐁 AI 자동 분류
        </div>
        <div aria-live="polite" className="mt-2 text-sm leading-relaxed text-neutral-700">
          {manual ? (
            <p>직접 고른 카테고리를 사용해요. 선택하지 않으면 전체 이야기에 올라가요.</p>
          ) : suggestion ? (
            <p>
              <strong className="text-neutral-850">{suggestion.label} 이야기</strong>로 분류했어요.
              다르면 위에서 바꿔 주세요.
            </p>
          ) : state?.phase === 'loading' ? (
            <p role="status">포퐁 AI가 어떤 아이인지 살펴보고 있어요…</p>
          ) : state?.phase === 'waiting' ? (
            <p role="status">사진과 이야기를 확인한 뒤 자동으로 분류할게요.</p>
          ) : state?.phase === 'done' ? (
            <p>한 가지로 정하기 어려워요. 위에서 직접 고르거나 전체 이야기로 올려 주세요.</p>
          ) : state?.phase === 'error' ? (
            <p>지금은 자동 분류를 불러오지 못했어요. 직접 골라도 글을 올릴 수 있어요.</p>
          ) : (
            <p>글을 쓰거나 사진을 올리면 어울리는 카테고리를 자동으로 골라 드려요.</p>
          )}
        </div>
        {(manual || state?.phase === 'error') && (
          <Button
            type="button"
            size="sm"
            intent="ghost"
            onClick={() => {
              setManual(false)
              retry()
            }}
          >
            {manual ? '자동 분류 사용하기' : '다시 분류하기'}
          </Button>
        )}
        {!manual && (
          <p className="mt-3 text-xs leading-relaxed text-neutral-600">
            포퐁 AI가 글 앞부분과 새로 올린 첫 사진의 축소본으로 분류해요. 직접 고르면 자동 분류를
            멈춰요. 연락처 등 개인정보는 빼 주세요.
          </p>
        )}
      </div>
    </fieldset>
  )
}
