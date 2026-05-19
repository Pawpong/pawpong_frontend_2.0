'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'
import { EmojiIcon, LocationIcon } from '@/shared/assets/icons'

const Picker = dynamic(() => import('@emoji-mart/react'), {
  ssr: false,
})

interface EmojiData {
  native: string
}

interface PostToolbarProps {
  onEmojiSelect: (emoji: string) => void
}

const PostToolbar = ({ onEmojiSelect }: PostToolbarProps) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleEmojiSelect = (emoji: EmojiData) => {
    onEmojiSelect(emoji.native)
  }

  return (
    <div className="relative inline-flex h-10 self-start items-center gap-5 rounded-full border border-[#d3d3d3] px-5 tab:h-auto tab:py-[0.625rem]">
      <button
        ref={buttonRef}
        type="button"
        aria-label="이모지 추가"
        onClick={() => setShowPicker((prev) => !prev)}
      >
        <EmojiIcon className="size-6 text-text-primary" />
      </button>
      <button type="button" aria-label="위치 추가">
        <LocationIcon className="size-6 text-text-primary" />
      </button>

      {showPicker && (
        <div ref={pickerRef} className="absolute bottom-full left-0 z-20 mb-2">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            locale="ko"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}

export { PostToolbar }
