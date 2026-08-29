'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseImageUploadOptions {
  maxImages?: number
  onDirty?: () => void
}

/**
 * 화면에 걸린 사진 한 장.
 *
 * - `new`: 사용자가 방금 고른 파일. 제출 시 업로드해서 파일키를 얻어야 한다.
 * - `existing`: 임시저장 등으로 이미 서버에 올라간 사진. 다시 올리면 고아 파일이 생기므로
 *   파일키를 그대로 재사용한다.
 */
type ImageEntry =
  | { kind: 'new'; url: string; file: File }
  | { kind: 'existing'; url: string; fileName: string }

const isBlobUrl = (url: string) => url.startsWith('blob:')

/**
 * 미리보기 URL과 원본을 순서대로 유지한다.
 *
 * 표시 순서가 곧 서버에 보내는 사진 순서이고 대표 사진 인덱스의 기준이기도 해서,
 * 새로 고른 사진과 이미 올라간 사진을 한 배열에서 함께 관리한다.
 */
const useImageUpload = ({ maxImages = 10, onDirty }: UseImageUploadOptions = {}) => {
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const entriesRef = useRef<ImageEntry[]>([])
  // 복원 시점에 몇 장이 있었는지 — 이탈 가드가 '저장 후 지운 사진'을 변경으로 보게 한다
  const [seededCount, setSeededCount] = useState(0)

  // 언마운트 시 blob URL 만 회수한다 (서버 URL 은 해제 대상이 아니다)
  useEffect(
    () => () => {
      entriesRef.current.forEach((entry) => {
        if (isBlobUrl(entry.url)) URL.revokeObjectURL(entry.url)
      })
      entriesRef.current = []
    },
    [],
  )

  const commit = useCallback((next: ImageEntry[]) => {
    entriesRef.current = next
    return next
  }, [])

  const handleAddImages = useCallback(
    (fileList: FileList) => {
      setEntries((prev) => {
        const room = maxImages - prev.length
        if (room <= 0) return prev
        const added = Array.from(fileList)
          .slice(0, room)
          .map<ImageEntry>((file) => ({ kind: 'new', url: URL.createObjectURL(file), file }))
        if (added.length === 0) return prev
        onDirty?.()
        return commit([...prev, ...added])
      })
    },
    [maxImages, onDirty, commit],
  )

  const handleRemoveImage = useCallback(
    (index: number) => {
      setEntries((prev) => {
        const removed = prev[index]
        if (removed && isBlobUrl(removed.url)) URL.revokeObjectURL(removed.url)
        return commit(prev.filter((_, i) => i !== index))
      })
    },
    [commit],
  )

  /** 임시저장 복원 — 이미 올라간 사진들로 초기화한다 */
  const seedExisting = useCallback(
    (photos: { url: string; fileName: string }[]) => {
      setEntries((prev) => {
        // 사용자가 이미 뭔가 고른 뒤라면 덮어쓰지 않는다 (복원은 최초 1회)
        if (prev.length > 0) return prev
        const seeded = photos
          .slice(0, maxImages)
          .map((photo) => ({ kind: 'existing' as const, ...photo }))
        setSeededCount(seeded.length)
        return commit(seeded)
      })
    },
    [maxImages, commit],
  )

  return {
    entries,
    images: entries.map((entry) => entry.url),
    /** 새로 올려야 할 파일만 표시 순서대로 */
    files: entries.flatMap((entry) => (entry.kind === 'new' ? [entry.file] : [])),
    handleAddImages,
    handleRemoveImage,
    seedExisting,
    /**
     * 저장하지 않은 변경이 있는가 (이탈 가드용).
     *
     * 복원된 사진이 그대로 있는 것은 이미 저장된 상태라 변경이 아니다.
     * 새로 고른 사진이 있거나, 복원됐던 사진을 지운 경우만 변경으로 본다.
     */
    hasUnsavedChanges:
      entries.some((entry) => entry.kind === 'new') ||
      entries.filter((entry) => entry.kind === 'existing').length < seededCount,
  }
}

export { useImageUpload }
export type { ImageEntry }
