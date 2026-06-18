'use client'

import * as React from 'react'
import { Input } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { PlusIcon } from '@/shared/assets/icons'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'

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
    <div className={cn('bg-white py-3', CHAT_GUTTER_X)}>
      <div className={cn(CHAT_CONTENT_WIDTH, 'flex items-center gap-3')}>
        {/* 첨부 버튼 */}
        <button
          type="button"
          aria-label="파일 첨부"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#3e3e3e]"
        >
          <PlusIcon className="size-[0.875rem] text-white" />
        </button>

        {/* 입력 */}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="입력해보세요"
          disabled={disabled}
          className="flex-1"
        />

        {/* 보내기 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#3e3e3e] px-3 text-base leading-[1.5] font-semibold text-[#f6f6f6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          보내기
        </button>
      </div>
    </div>
  )
}

export { ChatMessageInput }
