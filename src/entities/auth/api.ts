import { apiClient } from '@/shared/api'
import type {
  ApiResponse,
  AuthResponseDto,
  AdopterRegistrationDto,
  BreederRegistrationDto,
} from '@/shared/types'

/** 이메일 중복 확인 */
export const checkEmailDuplicate = (email: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-email', { email })
    .then((res) => res.data.data?.isDuplicate ?? false)

/** 닉네임 중복 확인 */
export const checkNicknameDuplicate = (nickname: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-nickname', { nickname })
    .then((res) => res.data.data?.isDuplicate ?? false)

/** 브리더 상호명 중복 확인 */
export const checkBreederNameDuplicate = (breederName: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-breeder-name', { breederName })
    .then((res) => res.data.data?.isDuplicate ?? false)

/** SMS 인증 코드 발송 */
export const sendVerificationCode = async (phone: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>('/api/auth/phone/send-code', {
    phone: cleanPhone,
  })
  if (!response.data.success)
    throw new Error(response.data.message ?? 'Failed to send verification code.')
}

/** SMS 인증 코드 확인 */
export const verifyCode = async (phone: string, code: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>('/api/auth/phone/verify-code', {
    phone: cleanPhone,
    code,
  })
  if (!response.data.success)
    throw new Error(response.data.message ?? 'Verification code does not match.')
}

/** 입양자 회원가입 완료 */
export const completeAdopterRegistration = async (
  data: AdopterRegistrationDto,
): Promise<AuthResponseDto> => {
  const response = await apiClient.post<ApiResponse<AuthResponseDto>>('/api/auth/social/complete', {
    tempId: data.tempId,
    email: data.email,
    name: data.name,
    role: 'adopter',
    nickname: data.nickname,
    phone: data.phone,
    marketingAgreed: data.marketingAgreed ?? false,
  })
  if (!response.data.success || !response.data.data) throw new Error('Registration failed.')
  return response.data.data
}

/** 브리더 회원가입 완료 */
export const completeBreederRegistration = async (
  data: BreederRegistrationDto,
): Promise<AuthResponseDto> => {
  const response = await apiClient.post<ApiResponse<AuthResponseDto>>('/api/auth/social/complete', {
    ...data,
    role: 'breeder',
  })
  if (!response.data.success || !response.data.data) throw new Error('Registration failed.')
  return response.data.data
}

/** 서류 업로드 (회원가입) */
export const uploadBreederDocuments = async (
  tempId: string,
  files: { type: string; file: File }[],
  level: 'new' | 'elite',
): Promise<{ documentUrls: string[] }> => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
  formData.append('level', level)

  const response = await apiClient.post<ApiResponse<{ documentUrls: string[] }>>(
    '/api/auth/upload-breeder-documents',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, params: { tempId } },
  )
  if (!response.data.success || !response.data.data) throw new Error('Document upload failed.')
  return response.data.data
}

/** 프로필 이미지 업로드 (회원가입) */
export const uploadProfileImage = async (
  file: File,
  tempId?: string,
): Promise<{ url: string; filename: string; size: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  const url = tempId
    ? `/api/auth/upload-breeder-profile?tempId=${encodeURIComponent(tempId)}`
    : '/api/auth/upload-breeder-profile'

  const response = await apiClient.post<
    ApiResponse<{ url: string; filename: string; size: number }>
  >(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!response.data.success || !response.data.data)
    throw new Error('프로필 이미지 업로드에 실패했습니다.')
  return response.data.data
}

/** 로그아웃 */
export const logout = async (): Promise<{ message: string; loggedOutAt: string }> => {
  try {
    const response =
      await apiClient.post<ApiResponse<{ message: string; loggedOutAt: string }>>(
        '/api/auth/logout',
      )
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    if (!response.data.success || !response.data.data) throw new Error('로그아웃에 실패했습니다.')
    return response.data.data
  } catch (error) {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
    throw error
  }
}
