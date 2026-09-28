/** 사용자가 고를 수 있는 AI 필터 (운영 정보인 프롬프트·모델은 내려오지 않는다) */
export interface AiImageFilter {
  filterId: string
  name: string
  description: string
  thumbnailUrl?: string
}

/** 생성 작업 상태 — succeeded·failed 가 종료 상태 */
export type AiImageGenerationStatus = 'pending' | 'queued' | 'processing' | 'succeeded' | 'failed'

/** 생성 작업 조회 응답 */
export interface AiImageGeneration {
  jobId: string
  status: AiImageGenerationStatus
  filterId: string
  /** 성공 시 결과 이미지 URL */
  resultImageUrl?: string
  /** 성공 시 콘테스트 출품에 그대로 넘길 파일키 */
  resultObjectKey: string | null
  errorCode: string | null
  createdAt: string
  completedAt: string | null
}

/** 원본 사진 업로드 응답 */
export interface AiImageSourceUpload {
  inputObjectKey: string
  imageUrl: string | null
}

/** 생성 요청 */
export interface AiImageGenerationRequest {
  filterId: string
  inputObjectKey: string
  /** 대상 콘테스트 — 생성 횟수(3회) 산정 기준 */
  contestId?: string
}
