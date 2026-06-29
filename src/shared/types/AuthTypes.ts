/**
 * 인증 관련 타입 정의
 * 출처: auth.ts
 */

import type { AdopterProfileDto } from './AdopterTypes'
import type { BreederProfileResponseDto } from './BreederTypes'

export interface AdopterRegistrationDto {
  tempId: string
  email: string
  name: string
  nickname: string
  phone?: string
  marketingAgreed?: boolean
  /** 사전 업로드한 프로필 이미지 파일명 또는 URL */
  profileImage?: string
}

export interface BreederRegistrationDto {
  tempId: string
  provider: string
  email: string
  name: string
  phone: string
  petType: string
  plan: string
  breederName: string
  introduction?: string
  city: string
  district: string
  breeds: string[]
  level: string
  marketingAgreed: boolean
  /** 사전 업로드한 프로필 이미지 파일명 또는 URL */
  profileImage?: string
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  userInfo: AdopterProfileDto | BreederProfileResponseDto
}

export interface LogoutResponseDto {
  message: string
  loggedOutAt: string
}
