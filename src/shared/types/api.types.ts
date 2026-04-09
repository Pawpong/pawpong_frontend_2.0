/**
 * 공통 API 응답 래퍼
 * 모든 API 파일에서 중복 선언되던 것을 하나로 통합
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 공통 API 응답 래퍼 (code/timestamp 포함 버전)
 * home.ts, feed.ts, notification.ts에서 사용하던 형식
 */
export interface ApiResponseFull<T> {
  success: boolean;
  code: number;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * 페이지네이션 정보
 * breeder.ts, application.ts, adopter.ts 등 모든 파일에서 중복 선언되던 것을 통합
 */
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 페이지네이션 응답 래퍼
 */
export interface PaginationResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * 페이지네이션 포함 전체 API 응답 래퍼
 * feed, notification, adopter 등에서 공통으로 사용
 */
export type PaginatedApiResponse<T> = ApiResponseFull<PaginationResponse<T>>;
