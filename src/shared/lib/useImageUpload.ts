'use client'

import { useState, useCallback } from 'react'

interface UseImageUploadOptions {
  maxImages?: number
  onDirty?: () => void
}

const useImageUpload = ({ maxImages = 10, onDirty }: UseImageUploadOptions = {}) => {
  const [images, setImages] = useState<string[]>([])

  const handleAddImages = useCallback(
    (files: FileList) => {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, maxImages))
      onDirty?.()
    },
    [maxImages, onDirty],
  )

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  return { images, setImages, handleAddImages, handleRemoveImage }
}

export { useImageUpload }
