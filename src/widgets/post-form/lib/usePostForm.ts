import { useState, useCallback, useRef } from 'react'

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
  // 이미 서버에 올라가 있는 사진(URL). 수정 화면에서 지우면 이 목록에서만 빠진다.
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)
  // 이번에 고른 사진의 미리보기 URL — files 와 1:1 로 대응한다.
  const [newImages, setNewImages] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState(initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const images = [...uploadedImages, ...newImages]

  const handleAddImages = useCallback(
    (fileList: FileList) => {
      const room = maxImages - uploadedImages.length - newImages.length
      if (room <= 0) return
      const added = Array.from(fileList).slice(0, room)
      setNewImages((prev) => [...prev, ...added.map((file) => URL.createObjectURL(file))])
      setFiles((prev) => [...prev, ...added])
    },
    [maxImages, uploadedImages.length, newImages.length],
  )

  const handleRemoveImage = useCallback(
    (index: number) => {
      // 앞쪽은 기존 사진, 뒤쪽은 이번에 고른 사진
      if (index < uploadedImages.length) {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index))
        return
      }
      const newIndex = index - uploadedImages.length
      setNewImages((prev) => {
        const removed = prev[newIndex]
        if (removed) URL.revokeObjectURL(removed)
        return prev.filter((_, i) => i !== newIndex)
      })
      setFiles((prev) => prev.filter((_, i) => i !== newIndex))
    },
    [uploadedImages.length],
  )

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
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
    },
    [text],
  )

  return {
    images,
    /** 지우지 않고 남긴 기존 사진 URL — 수정 제출 시 파일명으로 변환해 함께 보낸다 */
    uploadedImages,
    files,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  }
}

export { usePostForm }
