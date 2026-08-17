import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type {
  ApiResponse,
  UploadBreederDocumentsResponse,
  RegisterAdopterRequest,
  RegisterBreederRequest,
  RegisterTokens,
  BreederUploadDocumentType,
} from '@/shared/types'

export const checkEmailDuplicate = (email: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>(`${API_VERSION}/auth/check-email`, { email })
    .then((res) => unwrap(res, '이메일 중복 확인에 실패했습니다.').isDuplicate)

export const checkNicknameDuplicate = (nickname: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>(`${API_VERSION}/auth/check-nickname`, { nickname })
    .then((res) => unwrap(res, '닉네임 중복 확인에 실패했습니다.').isDuplicate)

export const checkBreederNameDuplicate = (breederName: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>(`${API_VERSION}/auth/check-breeder-name`, {
      breederName,
    })
    .then((res) => unwrap(res, '브리더 상호명 중복 확인에 실패했습니다.').isDuplicate)

export const sendVerificationCode = async (phone: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>(`${API_VERSION}/auth/phone/send-code`, {
    phone: cleanPhone,
  })
  unwrapVoid(response, '인증 코드 발송에 실패했습니다.')
}

export const verifyCode = async (phone: string, code: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>(
    `${API_VERSION}/auth/phone/verify-code`,
    { phone: cleanPhone, code },
  )
  unwrapVoid(response, '인증 코드 확인에 실패했습니다.')
}

export const uploadBreederDocuments = async (
  tempId: string,
  files: { type: BreederUploadDocumentType; file: File }[],
  level: 'new' | 'elite',
): Promise<UploadBreederDocumentsResponse> => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
  formData.append('level', level)

  return apiClient
    .post<
      ApiResponse<UploadBreederDocumentsResponse>
    >(`${API_VERSION}/auth/upload-breeder-documents`, formData, { params: { tempId } })
    .then((res) => unwrap(res, '서류 업로드에 실패했습니다.'))
}

export const uploadProfileImage = async (
  file: File,
  tempId?: string,
): Promise<{ url: string; filename: string; size: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  const url = tempId
    ? `${API_VERSION}/auth/upload-breeder-profile?tempId=${encodeURIComponent(tempId)}`
    : `${API_VERSION}/auth/upload-breeder-profile`

  return apiClient
    .post<ApiResponse<{ url: string; filename: string; size: number }>>(url, formData)
    .then((res) => unwrap(res, '프로필 이미지 업로드에 실패했습니다.'))
}

export const logout = async (): Promise<{ message: string; loggedOutAt: string }> => {
  try {
    // skipAuthRefresh: 토큰이 만료돼 401이 나도 자동 refresh(→ 세션 재생성)를 타지 않도록 한다.
    // (안 그러면 로그아웃 도중 set-cookie 가 쿠키를 다시 심어 "로그아웃했는데 로그인 상태"가 된다.)
    const response = await apiClient.post<ApiResponse<{ message: string; loggedOutAt: string }>>(
      `${API_VERSION}/auth/logout`,
      undefined,
      { skipAuthRefresh: true } as ApiRequestConfig,
    )
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    return unwrap(response, '로그아웃에 실패했습니다.')
  } catch (error) {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
    throw error
  }
}

/**
 * 입양자 회원가입 (신규 계약).
 * social/complete 와 달리 상담 사전정보(counselDefaultProfile)와 약관 동의 이력을 함께 저장한다.
 */
export const registerAdopter = async (data: RegisterAdopterRequest): Promise<RegisterTokens> =>
  apiClient
    .post<ApiResponse<RegisterTokens>>(`${API_VERSION}/auth/register/adopter`, data)
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))

/** 브리더 회원가입 (신규 계약) — 서류는 사전 업로드한 경로를 함께 싣는다 */
export const registerBreeder = async (data: RegisterBreederRequest): Promise<RegisterTokens> =>
  apiClient
    .post<ApiResponse<RegisterTokens>>(`${API_VERSION}/auth/register/breeder`, data)
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))
