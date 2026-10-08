import { apiClient, API_VERSION, ApiError, unwrap } from '@/shared/api'
import type { UploadResponse } from '@/shared/types'
import {
  captureCommunityWriteSession,
  communityWriteRequestOptions,
} from '../lib/communityWriteSession'

export async function uploadCommunityReviewPhotos(files: File[], signal?: AbortSignal) {
  const assertCurrent = captureCommunityWriteSession(signal)
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  const response = await apiClient.post<{ success: boolean; data: UploadResponse[] }>(
    `${API_VERSION}/community/review/photos`,
    form,
    { ...communityWriteRequestOptions(signal), timeout: 60_000 },
  )
  assertCurrent()
  const data = unwrap(response)
  if (
    !Array.isArray(data) ||
    data.length !== files.length ||
    data.some(
      (file) =>
        !file ||
        typeof file.fileName !== 'string' ||
        !/^community\/review-(?:private-)?[a-f\d-]{36}\.(?:jpg|png|webp)$/.test(file.fileName),
    )
  )
    throw new ApiError('내 계정의 업로드 사진을 확인하지 못했어요. 다시 첨부해 주세요.', 502)
  return data
}
