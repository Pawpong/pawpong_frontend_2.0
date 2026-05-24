'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/Cn'

interface ChatMessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

const ChatMessageInput = ({ onSend, disabled }: ChatMessageInputProps) => {
  const [value, setValue] = React.useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white px-5 py-5 tab:px-8">
      {/* Add button */}
      <button
        type="button"
        className="flex size-[3.125rem] shrink-0 items-center justify-center rounded-full bg-fill-muted"
        aria-label="파일 첨부"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="#5d5d5d" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Input */}
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 입력"
          disabled={disabled}
          className={cn(
            'w-full rounded-2xl bg-fill-muted px-5 py-[0.9375rem] text-base leading-[1.375rem] font-medium text-text-primary outline-none',
            'placeholder:text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={cn(
          'flex h-[3.125rem] shrink-0 items-center justify-center rounded-full bg-fill-muted px-5',
          'text-sm font-semibold text-text-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        보내기
      </button>
    </div>
  )
}

export { ChatMessageInput }
