import { isApiError } from '@/shared/api'
import { isSocialProvider, type SocialProvider } from '@/shared/lib/socialLogin'

/**
 * 이미 가입된 이메일·휴대폰 번호면 백엔드가 409 응답 data 에 기존 가입 방법만 실어 보낸다
 * (`{ errorCode: 'SOCIAL_PROVIDER_MISMATCH', existingProvider: 'kakao' }`). 화면은 그 제공자 로그인 버튼을 띄운다.
 * 가입 완료(useSignupCompletion)와 휴대폰 인증(usePhoneVerification)이 같이 쓴다.
 */
export const existingProviderOf = (error: unknown): SocialProvider | undefined => {
  if (!isApiError(error) || error.status !== 409) return undefined
  const body = error.details
  const data = typeof body === 'object' && body !== null && 'data' in body ? body.data : undefined
  const provider =
    typeof data === 'object' && data !== null && 'existingProvider' in data
      ? data.existingProvider
      : undefined
  return typeof provider === 'string' && isSocialProvider(provider) ? provider : undefined
}

/** 이미 가입된 계정이라 막힌 경우(409) — 사용자가 틀린 게 아니라서 실패 횟수로 세지 않는다 */
export const isAlreadyRegisteredError = (error: unknown): boolean =>
  isApiError(error) && error.status === 409
