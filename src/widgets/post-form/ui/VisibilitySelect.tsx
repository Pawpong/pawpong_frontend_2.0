'use client'

import { Dropdown } from '@/shared/ui'

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '전체 공개', description: '모든 보호자에게 보여요' },
  { value: 'followers', label: '팔로워 공개', description: '내 팔로워에게만 보여요' },
  { value: 'private', label: '나만 보기', description: '나에게만 보여요' },
] as const

type VisibilityType = (typeof VISIBILITY_OPTIONS)[number]['value']

const isVisibility = (value: string): value is VisibilityType =>
  VISIBILITY_OPTIONS.some((option) => option.value === value)

interface VisibilitySelectProps {
  disabled?: boolean
  value: VisibilityType
  onChange: (value: VisibilityType) => void
  /** 목록 아래 한 줄 안내 */
  note?: string
}

/** 글쓰기 하단 도구 모음의 공개 범위 — 공통 Dropdown(bare)을 화면 아래에서 위로 연다 */
const VisibilitySelect = ({ value, onChange, disabled, note }: VisibilitySelectProps) => (
  <Dropdown
    appearance="bare"
    side="top"
    ariaLabel="게시글 공개 범위"
    options={VISIBILITY_OPTIONS}
    value={value}
    onValueChange={(next) => isVisibility(next) && onChange(next)}
    disabled={disabled}
    note={note}
  />
)

export { VisibilitySelect, type VisibilityType }
