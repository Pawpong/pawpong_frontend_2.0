import { useState, useCallback, useRef } from 'react'

interface UsePostFormOptions {
  maxImages?: number
}

const usePostForm = ({ maxImages = 10 }: UsePostFormOptions = {}) => {
  const [images, setImages] = useState<string[]>([])
  // 미리보기 URL(images) 과 1:1 로 대응하는 실제 File 객체 — 업로드 시 서버 전송에 사용.
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAddImages = useCallback(
    (fileList: FileList) => {
      const added = Array.from(fileList)
      const newImages = added.map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, maxImages))
      setFiles((prev) => [...prev, ...added].slice(0, maxImages))
    },
    [maxImages],
  )

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

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
