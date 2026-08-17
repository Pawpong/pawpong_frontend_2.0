'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseImageUploadOptions {
  maxImages?: number
  onDirty?: () => void
}

/** 미리보기 URL(images)과 원본 File(files)을 1:1로 유지한다 — 제출 시 files를 업로드해 파일명을 얻는다 */
const useImageUpload = ({ maxImages = 10, onDirty }: UseImageUploadOptions = {}) => {
  const [images, setImages] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const imagesRef = useRef<string[]>([])

  useEffect(
    () => () => {
      imagesRef.current.forEach((imageUrl) => URL.revokeObjectURL(imageUrl))
      imagesRef.current = []
    },
    [],
  )

  const handleAddImages = useCallback(
    (fileList: FileList) => {
      const room = maxImages - files.length
      if (room <= 0) return
      const added = Array.from(fileList).slice(0, room)
      setImages((prev) => {
        const next = [...prev, ...added.map((file) => URL.createObjectURL(file))]
        imagesRef.current = next
        return next
      })
      setFiles((prev) => [...prev, ...added])
      onDirty?.()
    },
    [maxImages, files.length, onDirty],
  )

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      const next = prev.filter((_, i) => i !== index)
      imagesRef.current = next
      return next
    })
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return { images, files, handleAddImages, handleRemoveImage }
}

export { useImageUpload }
