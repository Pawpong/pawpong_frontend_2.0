import { apiClient, API_VERSION } from './client'
import { unwrap, unwrapVoid } from './unwrap'
import type { UploadResponse } from '@/shared/types'

const UPLOAD_TIMEOUT = 60000

export const uploadRepresentativePhotos = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return apiClient
    .post<{ success: boolean; data: UploadResponse[]; message?: string }>(
      `${API_VERSION}/upload/representative-photos`,
      formData,
      { timeout: UPLOAD_TIMEOUT },
    )
    .then(unwrap)
}

export const uploadParentPetPhoto = async (
  petId: string,
  file: File,
  existingPhotos: string[] = [],
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('files', file)
  existingPhotos.forEach((photo) => formData.append('existingPhotos', photo))
  const result = await apiClient
    .post<{ success: boolean; data: UploadResponse | UploadResponse[]; message?: string }>(
      `${API_VERSION}/upload/parent-pet-photos/${petId}`,
      formData,
      { timeout: UPLOAD_TIMEOUT },
    )
    .then(unwrap)
  return Array.isArray(result) ? result[0] : result
}

export const uploadAvailablePetPhoto = async (
  petId: string,
  file: File,
  existingPhotos: string[] = [],
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('files', file)
  existingPhotos.forEach((photo) => formData.append('existingPhotos', photo))
  const result = await apiClient
    .post<{ success: boolean; data: UploadResponse | UploadResponse[]; message?: string }>(
      `${API_VERSION}/upload/available-pet-photos/${petId}`,
      formData,
      { timeout: UPLOAD_TIMEOUT },
    )
    .then(unwrap)
  return Array.isArray(result) ? result[0] : result
}

export const uploadSingleFile = (file: File, folder?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (folder) formData.append('folder', folder)
  return apiClient
    .post<{ success: boolean; data: UploadResponse; message?: string }>(
      `${API_VERSION}/upload/single`,
      formData,
      { timeout: UPLOAD_TIMEOUT },
    )
    .then(unwrap)
}

export const uploadMultipleFiles = (files: File[], folder?: string) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  if (folder) formData.append('folder', folder)
  return apiClient
    .post<{ success: boolean; data: UploadResponse[]; message?: string }>(
      `${API_VERSION}/upload/multiple`,
      formData,
      { timeout: UPLOAD_TIMEOUT },
    )
    .then(unwrap)
}

export const deleteFile = async (fileName: string): Promise<void> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(
    `${API_VERSION}/upload`,
    { data: { fileName } },
  )
  unwrapVoid(response, '파일 삭제에 실패했습니다.')
}
