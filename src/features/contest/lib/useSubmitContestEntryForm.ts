'use client'

import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadSingleFile } from '@/shared/api'
import { useSubmitContestEntry } from '../api/contest.mutations'

/** 콘테스트 응모 사진이 업로드되는 스토리지 폴더 */
const CONTEST_UPLOAD_FOLDER = 'contest'

/**
 * 콘테스트 참여 폼(사진 1장 + 한 줄 소개)을 백엔드 계약에 맞춰 제출한다.
 *
 * 1) 고른 사진을 upload 모듈로 먼저 업로드해 fileName 을 확보하고
 * 2) POST /contest/entry 로 photoFileName + description 을 보낸다.
 *
 * AI 도트 필터로 만든 사진은 이미 버킷에 있으므로 업로드 없이 그 파일키(photoFileName)로 바로 참여한다.
 *
 * 성공 시 entryId 를 반환한다. 콘테스트는 임시저장 개념이 없다.
 */
export const useSubmitContestEntryForm = () => {
  const uploadMutation = useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadSingleFile(file, folder),
  })
  const submitMutation = useSubmitContestEntry()
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = uploadMutation.isPending || submitMutation.isPending

  const submit = useCallback(
    async (
      input: ({ file: File } | { photoFileName: string }) & { description: string },
    ): Promise<string | null> => {
      setError(null)
      try {
        const photoFileName =
          'photoFileName' in input
            ? input.photoFileName
            : (
                await uploadMutation.mutateAsync({
                  file: input.file,
                  folder: CONTEST_UPLOAD_FOLDER,
                })
              ).fileName
        const { description } = input
        const entry = await submitMutation.mutateAsync({
          photoFileName,
          description: description.trim(),
        })
        return entry.entryId
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '콘테스트 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        setError(message)
        return null
      }
    },
    [uploadMutation, submitMutation],
  )

  return { submit, isSubmitting, error }
}
