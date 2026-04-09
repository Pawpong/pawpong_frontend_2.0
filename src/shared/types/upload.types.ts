/**
 * 파일 업로드 관련 타입 정의
 * 출처: upload.ts
 */

export interface UploadResponse {
  cdnUrl: string;
  fileName: string;
  fileSize: number;
}
