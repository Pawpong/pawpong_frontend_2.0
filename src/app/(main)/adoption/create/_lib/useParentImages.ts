'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 부모 행의 사진 1장.
 *
 * - `new`: 방금 고른 파일. 제출 시 업로드해 파일키를 얻는다.
 * - `existing`: 임시저장에서 복원한, 이미 올라간 사진. 키를 그대로 재사용한다.
 */
type ParentImage =
  | { kind: 'new'; url: string; file: File }
  | { kind: 'existing'; url: string; fileName: string }

const isBlobUrl = (url: string) => url.startsWith('blob:')

/**
 * 부모 행마다 사진 1장 (서버 ParentPetSnapshotRequestDto.photoFileName 이 부모별이라 행 단위로 들고 있는다).
 *
 * 키는 배열 인덱스가 아니라 useFieldArray 가 주는 row id 다.
 * 인덱스로 잡으면 첫 번째 부모를 지웠을 때 두 번째 부모가 앞 사람 사진을 물려받는다.
 */
const useParentImages = () => {
  const [byRowId, setByRowId] = useState<Record<string, ParentImage>>({})
  // 복원 시점 장수 — 이탈 가드가 '저장 후 지운 사진'을 변경으로 보게 한다
  const [seededCount, setSeededCount] = useState(0)

  // 언마운트 시 남은 blob URL 정리 — 최신 값을 ref 로 따라간다
  const latestRef = useRef(byRowId)
  useEffect(() => {
    latestRef.current = byRowId
  }, [byRowId])
  useEffect(
    () => () => {
      Object.values(latestRef.current).forEach((image) => {
        if (isBlobUrl(image.url)) URL.revokeObjectURL(image.url)
      })
    },
    [],
  )

  /** 행당 1장이라 새로 고르면 기존 사진을 대체한다 */
  const add = useCallback((rowId: string, files: FileList) => {
    const file = files[0]
    if (!file) return
    setByRowId((prev) => {
      const previous = prev[rowId]
      if (previous && isBlobUrl(previous.url)) URL.revokeObjectURL(previous.url)
      return { ...prev, [rowId]: { kind: 'new', url: URL.createObjectURL(file), file } }
    })
  }, [])

  const remove = useCallback((rowId: string) => {
    setByRowId((prev) => {
      const target = prev[rowId]
      if (!target) return prev
      if (isBlobUrl(target.url)) URL.revokeObjectURL(target.url)
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

  /**
   * 행 순서대로 업로드할 파일 — 사진 없는 행과 이미 올라간 행은 빈 배열이라
   * 인덱스가 부모 순서와 그대로 맞는다.
   */
  const filesInOrder = useCallback(
    (rowIds: string[]) =>
      rowIds.map((rowId) => {
        const image = byRowId[rowId]
        return image?.kind === 'new' ? [image.file] : []
      }),
    [byRowId],
  )

  /** 행 순서대로 이미 올라간 파일키 — 없으면 undefined (재업로드하지 않고 재사용) */
  const existingFileNamesInOrder = useCallback(
    (rowIds: string[]) =>
      rowIds.map((rowId) => {
        const image = byRowId[rowId]
        return image?.kind === 'existing' ? image.fileName : undefined
      }),
    [byRowId],
  )

  /** 임시저장 복원 — 행 id 와 (URL, 파일키) 를 짝지어 채운다 */
  const seedExisting = useCallback(
    (photos: { rowId: string; url: string; fileName: string }[]) => {
      setByRowId((prev) => {
        // 사용자가 이미 뭔가 고른 뒤라면 덮어쓰지 않는다 (복원은 최초 1회)
        if (Object.keys(prev).length > 0) return prev
        setSeededCount(photos.length)
        return Object.fromEntries(
          photos.map((photo) => [
            photo.rowId,
            { kind: 'existing' as const, url: photo.url, fileName: photo.fileName },
          ]),
        )
      })
    },
    [],
  )

  const images = Object.values(byRowId)

  /**
   * 저장하지 않은 변경이 있는가 (이탈 가드용).
   * 복원된 사진이 그대로 있는 것은 변경이 아니다 — 새로 고르거나 지운 경우만 본다.
   */
  const hasUnsavedChanges =
    images.some((image) => image.kind === 'new') ||
    images.filter((image) => image.kind === 'existing').length < seededCount

  return {
    add,
    remove,
    imagesOf,
    filesInOrder,
    existingFileNamesInOrder,
    seedExisting,
    hasUnsavedChanges,
  }
}

export { useParentImages }
