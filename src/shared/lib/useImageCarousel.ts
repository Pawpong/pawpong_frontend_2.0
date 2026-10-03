'use client'

import { useCallback, useState } from 'react'

const useImageCarousel = (images: string[], initialIndex = 0) => {
  const [index, setCurrentIndex] = useState(initialIndex)
  const [previousInitialIndex, setPreviousInitialIndex] = useState(initialIndex)
  const initialIndexChanged = !Object.is(previousInitialIndex, initialIndex)
  const requestedIndex = initialIndexChanged ? initialIndex : index
  const currentIndex = Number.isFinite(requestedIndex)
    ? Math.max(0, Math.min(Math.trunc(requestedIndex), images.length - 1))
    : 0

  // 다른 사진을 열거나 목록이 줄면 커밋 전에 선택을 맞춰 이전/없는 사진이 깜박이지 않게 한다.
  if (initialIndexChanged) setPreviousInitialIndex(initialIndex)
  if (!Object.is(index, currentIndex)) setCurrentIndex(currentIndex)

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, images.length - 1)))
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
