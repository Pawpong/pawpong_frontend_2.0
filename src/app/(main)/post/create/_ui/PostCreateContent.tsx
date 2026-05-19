'use client'

import { useState, useCallback } from 'react'
import { PostCreateHeader } from './PostCreateHeader'
import { ImageUploadArea } from './ImageUploadArea'
import { PostTextArea } from './PostTextArea'
import { PostToolbar } from './PostToolbar'
import { PostCreateCTA } from './PostCreateCTA'

const PostCreateContent = () => {
  const [images, setImages] = useState<string[]>([])
  const [text, setText] = useState('')

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

  const isValid = text.trim().length > 0 || images.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PostCreateHeader />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-6 px-5 pb-[7.5rem] pt-10 tab:flex-row tab:gap-0 tab:px-[6.25rem] tab:pt-[5.5rem]">
        {/* Left — Image Upload */}
        <div className="tab:w-[26.256rem] tab:shrink-0">
          <ImageUploadArea
            images={images}
            onAdd={handleAddImages}
            onRemove={handleRemoveImage}
          />
        </div>

        {/* Right — Text + Toolbar */}
        <div className="flex flex-1 flex-col gap-[1.125rem] tab:ml-[2.5rem]">
          <PostTextArea value={text} onChange={setText} />
          <PostToolbar />
        </div>
      </div>

      <PostCreateCTA
        onSaveDraft={() => {}}
        onUpload={() => {}}
        isValid={isValid}
      />
    </div>
  )
}

export { PostCreateContent }
