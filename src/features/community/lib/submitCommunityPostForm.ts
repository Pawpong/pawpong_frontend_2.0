import { uploadMultipleFiles } from '@/shared/api'
import { createCommunityPost, updateCommunityPost } from '../api/community.api'
import { uploadCommunityReviewPhotos } from '../api/communityReviewPhotos.api'
import type { CommunityPostFormInput } from '../model/community-post-form.type'
import { captureCommunityWriteSession } from './communityWriteSession'
import { COMMUNITY_UPLOAD_FOLDER, toCommunityPhotoFileName } from './communityPhotoFileName'

export async function submitCommunityPostForm(
  input: CommunityPostFormInput,
  postId?: string,
  signal?: AbortSignal,
) {
  const assertCurrent = captureCommunityWriteSession(signal)
  const uploaded = input.files.length
    ? (
        await (input.useOwnedPhotoUpload === true ||
        (input.status === 'published' && input.aiReviewConsent !== undefined)
          ? uploadCommunityReviewPhotos(input.files, signal)
          : uploadMultipleFiles(input.files, COMMUNITY_UPLOAD_FOLDER, signal))
      ).map((file) => file.fileName)
    : []
  assertCurrent()
  const kept = (input.keptImageUrls ?? []).map(toCommunityPhotoFileName)
  if (kept.some((name) => name === null))
    throw new Error('비교 사진을 확인할 수 없습니다. 사진을 다시 첨부해 주세요.')
  const command = {
    ...(input.experience !== undefined ? { experience: input.experience } : {}),
    ...(input.status === 'published' && input.aiReviewConsent !== undefined
      ? { aiReviewConsent: input.aiReviewConsent }
      : {}),
    body: input.text.trim(),
    photos: [...kept.filter((name): name is string => name !== null), ...uploaded],
    visibility: input.visibility,
    status: input.status,
    aiComparison: input.aiComparison,
  }
  const post = postId
    ? await updateCommunityPost(postId, { ...command, petType: input.petType }, signal)
    : await createCommunityPost({ ...command, petType: input.petType ?? undefined }, signal)
  assertCurrent()
  return post
}
