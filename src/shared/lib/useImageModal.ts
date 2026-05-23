'use client'

import { useCallback, useState } from 'react'

const useImageModal = (defaultImages: string[] = []) => {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>(defaultImages)
  const [modalInitialIndex, setModalInitialIndex] = useState(0)

  const openImageModal = useCallback((images: string[], index = 0) => {
    setModalImages(images)
    setModalInitialIndex(index)
    setImageModalOpen(true)
  }, [])

  return {
    imageModalOpen,
    setImageModalOpen,
    modalImages,
    modalInitialIndex,
    openImageModal,
  }
}

export { useImageModal }
