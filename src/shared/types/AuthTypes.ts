/**
 * 인증 관련 타입 정의
 * 출처: auth.ts
 */

import type { TermsCode } from './TermsTypes'

// ─── 신규 가입 계약 (POST /auth/register/adopter · /auth/register/breeder) ───

/** 동의 이력 — 마케팅 동의도 별도 필드가 아니라 이 배열에 'marketing' 을 넣어 표시한다 */
export interface TermsAgreementItem {
  code: TermsCode
  version: string
}

/** 입양 상담용 사전 정보 — 온보딩 조사 양식 답변이 여기로 들어간다 */
export interface CounselDefaultProfile {
  selfIntroduction: string
  dailyAbsenceHours?: string
  livingSpaceDescription?: string
  counselPrivacyAgreed: boolean
}

export interface RegisterAdopterRequest {
  tempId: string
  email: string
  nickname: string
  /** 공개 프로필 한 줄 소개 (trim 후 최대 200자) */
  bio?: string
  /** 실명 (상담 시 표시) */
  realName: string
  phone?: string
  profileImage?: string
  interestedBreedIds?: string[]
  counselDefaultProfile?: CounselDefaultProfile
  termsAgreements: TermsAgreementItem[]
}

export interface RegisterBreederAgreements {
  termsOfService: boolean
  privacyPolicy: boolean
  marketingConsent?: boolean
}

export interface RegisterBreederRequest {
  email: string
  phoneNumber: string
  breederName: string
  breederLocation: { city: string; district?: string }
  animal: 'cat' | 'dog' | 'reptile'
  /** 최대 5개 */
  breeds: string[]
  plan: 'basic' | 'pro'
  agreements: RegisterBreederAgreements
  tempId?: string
  provider?: string
  profileImage?: string
  /** 사전 업로드 응답의 파일 경로 배열 (documentTypes 와 순서 일치) */
  documentUrls?: string[]
  documentTypes?: BreederDocumentType[]
}

export type BreederUploadDocumentType = 'idCard' | 'animalProductionLicense'

export type BreederDocumentType =
  | 'id_card'
  | 'animal_production_license'
  | 'adoption_contract_sample'
  | 'pedigree'
  | 'breeder_certification'

/** 브리더 인증 서류 업로드 응답 항목 — type 은 서버 표기(snake_case) 그대로 온다 */
export interface UploadedVerificationDocument {
  type: BreederDocumentType
  url: string
  filename: string
  size: number
  uploadedAt: string
}

export interface UploadBreederDocumentsResponse {
  /** 이번 요청으로 올라간 서류 */
  uploadedDocuments: UploadedVerificationDocument[]
  /** 기존 + 이번 업로드 전체 */
  allDocuments: UploadedVerificationDocument[]
}

/** 가입 응답 — 두 엔드포인트 모두 토큰을 최상위로 준다 */
export interface RegisterTokens {
  accessToken: string
  refreshToken: string
}

export interface LogoutResponseDto {
  message: string
  loggedOutAt: string
}

// ─── SSO 탈퇴 계정 복구 (POST /api/v2/auth/reactivate) ───

/**
 * 소셜 콜백이 탈퇴 계정 로그인 시 /login 쿼리로 넘겨주는 복구 안내 정보.
 *
 * 주의: 안내 문구는 `error` 가 아니라 `message` 파라미터로 온다.
 *       (정지 계정처럼 복구 대상이 아닌 차단 케이스는 기존대로 `error` 로 온다)
 */
export interface ReactivationPrompt {
  /** 소셜 콜백에서만 발급되는 단기 JWT — 이 값이 있어야 복구 확인 UI를 띄운다 */
  reactivationToken: string
  message?: string
  email?: string
  /** 입양자는 닉네임, 브리더는 상호명 */
  name?: string
  /** 탈퇴 일시 (ISO8601) — 백엔드가 못 채울 수 있다 */
  deletedAt?: string
  returnUrl?: string
  /** 복구 토큰 유효시간(초). 콜백 기본값 600(10분) */
  expiresIn: number
}

/** 복구 성공 응답 — 소셜 로그인 성공과 동일한 토큰 세트를 준다 */
export interface ReactivateAccountResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
  role: 'adopter' | 'breeder'
  userInfo: {
    userId: string
    email: string
    name: string
    profileImage?: string
  }
}
