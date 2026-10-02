import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  AiImageFilter,
  AiImageGeneration,
  AiImageGenerationRequest,
  AiImageSourceUpload,
  ApiResponseFull,
} from '@/shared/types'

/** 사진 전송은 기본 타임아웃보다 오래 걸릴 수 있다 (콘테스트 업로드와 같은 값) */
const UPLOAD_TIMEOUT = 60000
const STATUS_TIMEOUT = 10000

interface AiImageRequestOptions {
  signal?: AbortSignal
  timeout?: number
}

/** 활성 AI 필터 목록 (정렬 순서대로) */
export const getAiImageFilters = async (): Promise<AiImageFilter[]> => {
  const response = await apiClient.get<ApiResponseFull<AiImageFilter[]>>(
    `${API_VERSION}/ai-image/filters`,
  )
  return unwrap(response, 'AI 필터를 불러오지 못했습니다.')
}

/**
 * 원본 사진 업로드.
 * 버킷 직업로드(presigned PUT)는 CORS 로 막혀 있어 서버 경유 업로드를 쓴다.
 */
export const uploadAiImageSource = async (
  file: File,
  options: AiImageRequestOptions = {},
): Promise<AiImageSourceUpload> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiResponseFull<AiImageSourceUpload>>(
    `${API_VERSION}/ai-image/source`,
    formData,
    { timeout: UPLOAD_TIMEOUT, ...options },
  )
  return unwrap(response, '사진을 올리지 못했습니다.')
}

/** 생성 요청 — 결과는 getAiImageGeneration 으로 폴링한다 */
export const requestAiImageGeneration = async (
  data: AiImageGenerationRequest,
  options: AiImageRequestOptions = {},
): Promise<AiImageGeneration> => {
  const response = await apiClient.post<ApiResponseFull<AiImageGeneration>>(
    `${API_VERSION}/ai-image/generation`,
    data,
    options,
  )
  return unwrap(response, 'AI 변환을 시작하지 못했습니다.')
}

/** 생성 상태 조회 (본인 작업만) */
export const getAiImageGeneration = async (
  jobId: string,
  options: AiImageRequestOptions = {},
): Promise<AiImageGeneration> => {
  const response = await apiClient.get<ApiResponseFull<AiImageGeneration>>(
    `${API_VERSION}/ai-image/generation/${jobId}`,
    { timeout: STATUS_TIMEOUT, ...options },
  )
  return unwrap(response, 'AI 변환 상태를 확인하지 못했습니다.')
}

/**
 * 내 완성 결과 이미지(PNG) 바이트.
 * 버킷에 CORS 가 없어 결과 URL 을 fetch 로 읽을 수 없으므로 API 로 받는다.
 * 커뮤니티 글쓰기는 이걸 일반 사진 파일로 만들어 기존 업로드 흐름에 태운다.
 */
export const getAiImageGenerationImage = async (
  jobId: string,
  options: AiImageRequestOptions = {},
): Promise<Blob> => {
  const response = await apiClient.get<Blob>(`${API_VERSION}/ai-image/generation/${jobId}/image`, {
    responseType: 'blob',
    timeout: UPLOAD_TIMEOUT,
    ...options,
  })
  return response.data
}

/** 원본은 소유자 인증 후 조회한다. 모달이 닫히면 요청도 취소할 수 있다. */
export const getAiImageGenerationSourceImage = async (
  jobId: string,
  signal?: AbortSignal,
): Promise<Blob> => {
  const response = await apiClient.get<Blob>(
    `${API_VERSION}/ai-image/generation/${jobId}/source-image`,
    {
      responseType: 'blob',
      timeout: UPLOAD_TIMEOUT,
      signal,
    },
  )
  return response.data
}

/** 내 AI 사진 보관함 (최신순, 최대 60건 — 진행 중·실패 포함) */
export const getMyAiImageGenerations = async (): Promise<AiImageGeneration[]> => {
  const response = await apiClient.get<ApiResponseFull<AiImageGeneration[]>>(
    `${API_VERSION}/ai-image/generations`,
  )
  return unwrap(response, 'AI 사진 보관함을 불러오지 못했습니다.')
}

/** 보관함에서 지우기 (기록은 남아 하루 횟수에는 포함된다) */
export const hideAiImageGeneration = async (jobId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponseFull<{ jobId: string; hidden: boolean }>>(
    `${API_VERSION}/ai-image/generation/${jobId}`,
  )
  unwrap(response, '보관함에서 지우지 못했습니다.')
}
