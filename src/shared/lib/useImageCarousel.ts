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

  return {
    currentIndex,
    setCurrentIndex,
    handlePrev,
    handleNext,
  }
}

export { useImageCarousel }
