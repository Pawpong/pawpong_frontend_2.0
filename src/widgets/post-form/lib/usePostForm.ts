import { useState, useCallback, useRef } from 'react'

interface UsePostFormOptions {
  maxImages?: number
}

const usePostForm = ({ maxImages = 10 }: UsePostFormOptions = {}) => {
  const [images, setImages] = useState<string[]>([])
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, maxImages))
  }, [maxImages])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleEmojiSelect = useCallback((emoji: string) => {
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
  }, [text])

  return {
    images,
    text,
    setText,
    textareaRef,
    handleAddImages,
    handleRemoveImage,
    handleEmojiSelect,
  }
}

export { usePostForm }
