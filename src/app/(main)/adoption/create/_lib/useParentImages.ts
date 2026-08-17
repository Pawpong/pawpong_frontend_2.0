'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ParentImage {
  /** 미리보기 blob URL */
  url: string
  file: File
}

/**
 * 부모 행마다 사진 1장 (서버 ParentPetSnapshotRequestDto.photoFileName 이 부모별이라 행 단위로 들고 있는다).
 *
 * 키는 배열 인덱스가 아니라 useFieldArray 가 주는 row id 다.
 * 인덱스로 잡으면 첫 번째 부모를 지웠을 때 두 번째 부모가 앞 사람 사진을 물려받는다.
 */
const useParentImages = () => {
  const [byRowId, setByRowId] = useState<Record<string, ParentImage>>({})

  // 언마운트 시 남은 blob URL 정리 — 최신 값을 ref 로 따라간다
  const latestRef = useRef(byRowId)
  useEffect(() => {
    latestRef.current = byRowId
  }, [byRowId])
  useEffect(
    () => () => {
      Object.values(latestRef.current).forEach((image) => URL.revokeObjectURL(image.url))
    },
    [],
  )

  /** 행당 1장이라 새로 고르면 기존 사진을 대체한다 */
  const add = useCallback((rowId: string, files: FileList) => {
    const file = files[0]
    if (!file) return
    setByRowId((prev) => {
      const previous = prev[rowId]
      if (previous) URL.revokeObjectURL(previous.url)
      return { ...prev, [rowId]: { url: URL.createObjectURL(file), file } }
    })
  }, [])

  const remove = useCallback((rowId: string) => {
    setByRowId((prev) => {
      const target = prev[rowId]
      if (!target) return prev
      URL.revokeObjectURL(target.url)
      const next = { ...prev }
      delete next[rowId]
      return next
    })
  }, [])

  /** ImageUploadArea 가 받는 형태 (0장 또는 1장) */
  const imagesOf = useCallback(
    (rowId: string) => {
      const image = byRowId[rowId]
      return image ? [image.url] : []
    },
    [byRowId],
  )

  /** 행 순서대로 업로드할 파일 — 사진 없는 행은 빈 배열이라 인덱스가 부모 순서와 그대로 맞는다 */
  const filesInOrder = useCallback(
    (rowIds: string[]) =>
      rowIds.map((rowId) => {
        const image = byRowId[rowId]
        return image ? [image.file] : []
      }),
    [byRowId],
  )

  const hasFiles = Object.keys(byRowId).length > 0

  return { add, remove, imagesOf, filesInOrder, hasFiles }
}

export { useParentImages }
