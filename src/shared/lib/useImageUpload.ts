'use client'

import { useState, useCallback } from 'react'

interface UseImageUploadOptions {
  maxImages?: number
  onDirty?: () => void
}

const useImageUpload = ({ maxImages = 10, onDirty }: UseImageUploadOptions = {}) => {
  const [images, setImages] = useState<string[]>([])
  // 미리보기 URL(images) 과 1:1 로 대응하는 실제 File 객체 — 업로드 시 서버 전송에 사용.
  const [files, setFiles] = useState<File[]>([])

  const handleAddImages = useCallback(
    (fileList: FileList) => {
      const added = Array.from(fileList)
      const newImages = added.map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, maxImages))
      setFiles((prev) => [...prev, ...added].slice(0, maxImages))
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
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return { images, files, setImages, setFiles, handleAddImages, handleRemoveImage }
}

export { useImageUpload }
