import { useState, useCallback, useEffect, useRef } from 'react'
import { preparePhotoForPreview } from '@/shared/lib/preparePhoto'

interface UsePostFormOptions {
  maxImages?: number
  /** 수정 화면 초기값 — 기존 본문 */
  initialText?: string
  /** 수정 화면 초기값 — 이미 업로드된 사진 URL (남긴 것만 제출 시 파일명으로 변환) */
  initialImages?: string[]
}

const usePostForm = ({
  maxImages = 10,
  initialText = '',
  initialImages = [],
}: UsePostFormOptions = {}) => {
  // 수정 기준값은 이 폼 인스턴스가 처음 열린 시점으로 고정한다.
  const [initialTextValue] = useState(initialText)
  const [initialImageValues] = useState(initialImages)
  // 이미 서버에 올라가 있는 사진(URL). 수정 화면에서 지우면 이 목록에서만 빠진다.
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)
  const uploadedImagesRef = useRef(uploadedImages)
  // Keep each file and its preview together so removing a photo cannot shift just one list.
  const [newPhotos, setNewPhotos] = useState<{ file: File; url: string }[]>([])
  const newPhotosRef = useRef(newPhotos)
  const [text, setText] = useState(initialText)
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const processingRef = useRef(false)
  const selectionId = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      selectionId.current += 1
      processingRef.current = false
      newPhotosRef.current.forEach(({ url }) => URL.revokeObjectURL(url))
    }
  }, [])

  const images = [...uploadedImages, ...newPhotos.map(({ url }) => url)]
  const files = newPhotos.map(({ file }) => file)

  const hasChanges =
    text !== initialTextValue ||
    files.length > 0 ||
    isProcessingPhotos ||
    uploadedImages.length !== initialImageValues.length ||
    uploadedImages.some((image, index) => image !== initialImageValues[index])

  const handleAddImages = useCallback(
    async (fileList: FileList) => {
      // The input is reset immediately after onAdd; copy FileList before any await.
      const selected = Array.from(fileList)
      if (processingRef.current || !mountedRef.current) return
      const room = maxImages - uploadedImagesRef.current.length - newPhotosRef.current.length
      const added = selected.slice(0, Math.max(0, room))
      if (added.length === 0) return
      const id = ++selectionId.current
      processingRef.current = true
      setIsProcessingPhotos(true)
      setPhotoError(null)
      const prepared: File[] = []
      const failures: string[] = []
      // Process in selection order and avoid decoding ten large photos simultaneously.
      for (const file of added) {
        try {
          prepared.push(await preparePhotoForPreview(file))
        } catch (error) {
          failures.push(
            `${file.name}: ${error instanceof Error ? error.message : '사진을 처리하지 못했습니다.'}`,
          )
        }
        if (!mountedRef.current || id !== selectionId.current) return
      }
      const next = [
        ...newPhotosRef.current,
        ...prepared.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]
      newPhotosRef.current = next
      setNewPhotos(next)
      setPhotoError(failures.length ? failures.join('\n') : null)
      processingRef.current = false
      setIsProcessingPhotos(false)
    },
    [maxImages],
  )

  const cancelPhotoProcessing = useCallback(() => {
    selectionId.current += 1
    processingRef.current = false
    setIsProcessingPhotos(false)
  }, [])

  // Also used inside save(), before React has rendered the disabled button.
  const hasPendingPhotos = useCallback(() => processingRef.current, [])

  const handleRemoveImage = useCallback((index: number) => {
    if (processingRef.current) return
    const uploaded = uploadedImagesRef.current
    if (index < uploaded.length) {
      const next = uploaded.filter((_, i) => i !== index)
      uploadedImagesRef.current = next
      setUploadedImages(next)
      return
    }
    const newIndex = index - uploaded.length
    const removed = newPhotosRef.current[newIndex]
    if (!removed) return
    URL.revokeObjectURL(removed.url)
    const next = newPhotosRef.current.filter((_, i) => i !== newIndex)
    newPhotosRef.current = next
    setNewPhotos(next)
  }, [])

  return {
    images,
    /** ImageUploadArea 에도 같은 상한을 넘겨야 해서 함께 돌려준다 */
    maxImages,
    /** 지우지 않고 남긴 기존 사진 URL — 수정 제출 시 파일명으로 변환해 함께 보낸다 */
    uploadedImages,
    files,
    text,
    hasChanges,
    setText,
    handleAddImages,
    handleRemoveImage,
    isProcessingPhotos,
    photoError,
    hasPendingPhotos,
    cancelPhotoProcessing,
  }
}

type PostFormState = ReturnType<typeof usePostForm>

export { usePostForm }
export type { PostFormState }
