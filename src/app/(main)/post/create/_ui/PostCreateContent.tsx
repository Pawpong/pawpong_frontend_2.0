'use client'

import { useState, useCallback, useRef } from 'react'
import { Container } from '@/shared/ui'
import { PostCreateHeader } from './PostCreateHeader'
import { ImageUploadArea } from './ImageUploadArea'
import { PostTextArea } from './PostTextArea'
import { PostToolbar } from './PostToolbar'
import { PostCreateCTA } from './PostCreateCTA'
import { VisibilitySelect, type VisibilityType } from './VisibilitySelect'

const PostCreateContent = () => {
  const [images, setImages] = useState<string[]>([])
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('public')

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 10))
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

  const isValid = text.trim().length > 0 || images.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostCreateHeader />

      {/* Body */}
      <Container className="flex-1 pb-[7.5rem] pt-[0.719rem] tab:px-[6.25rem] tab:pt-[5.5rem]">
        <div className="flex flex-col gap-[1.125rem] tab:flex-row tab:gap-0">
          {/* Left — Image Upload */}
          <div className="tab:w-[26.256rem] tab:shrink-0">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
            />
          </div>

          {/* Right — Text + Toolbar + Visibility (mobile) */}
          <div className="flex flex-1 flex-col tab:ml-[2.5rem]">
            <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
              <PostTextArea ref={textareaRef} value={text} onChange={setText} />
              <PostToolbar onEmojiSelect={handleEmojiSelect} />
            </div>

            {/* Visibility — mobile only */}
            <div className="mt-[1.125rem] tab:hidden">
              <VisibilitySelect value={visibility} onChange={setVisibility} />
            </div>
          </div>
        </div>
      </Container>

      <PostCreateCTA
        visibility={visibility}
        onVisibilityChange={setVisibility}
        onSaveDraft={() => { }}
        onUpload={() => { }}
        isValid={isValid}
      />
    </div>
  )
}

export { PostCreateContent }
