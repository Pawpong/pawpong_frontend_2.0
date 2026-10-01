import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'

export interface PetClassification {
  subject: 'animal' | 'not_animal' | 'unclear'
  petType: 'dog' | 'cat' | 'reptile' | 'other' | 'mixed' | 'unknown'
}

/** 사용자가 추천을 요청했을 때만 글 앞부분과 첫 사진의 축소본을 전송한다. */
export async function classifyPetContent(
  text: string,
  photo: Blob | undefined,
  signal: AbortSignal,
): Promise<PetClassification> {
  const data = new FormData()
  data.append('text', text.trim().slice(0, 2000))
  if (photo) data.append('file', photo, 'pet-preview.jpg')
  const response = await apiClient.post<ApiResponseFull<PetClassification>>(
    `${API_VERSION}/ai-image/classify`,
    data,
    { signal, timeout: 20000 },
  )
  return unwrap(response, 'AI 추천을 불러오지 못했어요. 카테고리를 직접 골라 주세요.')
}
