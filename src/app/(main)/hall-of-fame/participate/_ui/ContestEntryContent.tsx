'use client'

import { useState, useCallback, useRef } from 'react'
import { Container } from '@/shared/ui'
import {
  PostFormHeader,
  PostFormTextArea,
  PostFormToolbar,
  PostFormCTA,
  ImageUploadArea,
} from '@/widgets/post-form'

const ContestEntryContent = () => {
  const [images, setImages] = useState<string[]>([])
  const [text, setText] = useState('')

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 1))
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleEmojiSelect = useCallback((emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = text.slice(0, start) + emoji + text.slice(end)
      setText(newText)
      requestAnimationFrame(() => {
        const pos = start + emoji.length
        textarea.selectionStart = pos
        textarea.selectionEnd = pos
        textarea.focus()
      })
    } else {
      setText((prev) => prev + emoji)
    }
  }, [text])

  const isValid = text.trim().length > 0 && images.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostFormHeader title="명예의 전당 콘테스트 참여하기" />

      {/* Body */}
      <Container className="flex-1 pb-[7.5rem] pt-[0.719rem] tab:px-[6.25rem] tab:pt-[5.5rem]">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-0">
          {/* Left — Image Upload (1장만) */}
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              maxImages={1}
            />
          </div>

          {/* Right — Text + Toolbar */}
          <div className="flex flex-1 flex-col tab:ml-[2.5rem]">
            <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
              <PostFormTextArea
                ref={textareaRef}
                value={text}
                onChange={setText}
                placeholder="귀여운 파이리"
              />
              <PostFormToolbar onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        </div>
      </Container>

      <PostFormCTA
        onSaveDraft={() => { }}
        onSubmit={() => { }}
        submitLabel="참여하기"
        isValid={isValid}
      />
    </div>
  )
}

export { ContestEntryContent }
