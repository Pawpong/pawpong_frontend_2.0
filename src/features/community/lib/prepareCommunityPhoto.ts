import { preparePhoto, validatePhoto } from '@/shared/lib/preparePhoto'
import {
  readCommunityPhotoLocation,
  readCommunityPhotoTakenAt,
  rememberCommunityPhotoLocation,
  rememberCommunityPhotoTakenAt,
} from './communityPhotoLocation'

/** 원본 위치는 기기 안에서 읽고, 업로드 사본에는 촬영 메타데이터를 남기지 않는다. */
export async function prepareCommunityPhoto(file: File): Promise<File> {
  validatePhoto(file)
  const location = await readCommunityPhotoLocation(file)
  const takenAt = await readCommunityPhotoTakenAt(file)
  const prepared = await preparePhoto(file)
  rememberCommunityPhotoLocation(prepared, location)
  rememberCommunityPhotoTakenAt(prepared, takenAt)
  return prepared
}
