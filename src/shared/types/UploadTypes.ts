/**
 * 파일 업로드 관련 타입 정의
 * 출처: upload.ts
 */

export interface UploadResponse {
  url: string
  cdnUrl: string
  filename: string
  fileName: string
  size: number
}
