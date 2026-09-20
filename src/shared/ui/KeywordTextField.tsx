'use client'

import { useState } from 'react'
import { Input } from './Input'

interface KeywordTextFieldProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxSelected?: number
}

const parseKeywords = (text: string, maxSelected?: number): string[] => {
  const items = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return maxSelected !== undefined ? items.slice(0, maxSelected) : items
}

// 서버는 이 목록을 자유 문자열 배열로 받는다(enum 없음) — 정해진 칩 목록으로 고를
// 이유가 없어 콤마로 구분해 입력받는다. 매 키 입력마다 배열로 되접으면 콤마 뒤 빈
// 항목이 filter 돼 커서가 튀므로, 텍스트는 로컬 state 로 자유롭게 두고 blur 시점에만
// 폼 값(배열)에 반영한다.
const KeywordTextField = ({ value, onChange, placeholder, maxSelected }: KeywordTextFieldProps) => {
  const [text, setText] = useState(() => value.join(', '))

  return (
    <Input
      type="text"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => onChange(parseKeywords(text, maxSelected))}
      placeholder={placeholder}
    />
  )
}

export { KeywordTextField }
