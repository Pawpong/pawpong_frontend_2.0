'use client'

import { useCallback, useEffect, useState } from 'react'

const useImageCarousel = (images: string[], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  // [refactored] 사진 모달 두 곳에 흩어져 있던 방향키 처리를 한 곳으로 (입력창 안에서는 무시)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (images.length < 2) return
      if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    },
    [images.length, handlePrev, handleNext],
  )

  return {
    currentIndex,
    setCurrentIndex,
    handlePrev,
    handleNext,
    handleKeyDown,
  }
}

export { useImageCarousel }
