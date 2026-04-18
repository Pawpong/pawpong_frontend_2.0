import { apiClient, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ApiResponse,
  AuthResponseDto,
  AdopterRegistrationDto,
  BreederRegistrationDto,
} from '@/shared/types'

export const checkEmailDuplicate = (email: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-email', { email })
    .then((res) => unwrap(res, '이메일 중복 확인에 실패했습니다.').isDuplicate)

export const checkNicknameDuplicate = (nickname: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-nickname', { nickname })
    .then((res) => unwrap(res, '닉네임 중복 확인에 실패했습니다.').isDuplicate)

export const checkBreederNameDuplicate = (breederName: string) =>
  apiClient
    .post<ApiResponse<{ isDuplicate: boolean }>>('/api/auth/check-breeder-name', { breederName })
    .then((res) => unwrap(res, '브리더 상호명 중복 확인에 실패했습니다.').isDuplicate)

export const sendVerificationCode = async (phone: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>('/api/auth/phone/send-code', {
    phone: cleanPhone,
  })
  unwrapVoid(response, '인증 코드 발송에 실패했습니다.')
}

export const verifyCode = async (phone: string, code: string): Promise<void> => {
  const cleanPhone = phone.replace(/-/g, '')
  const response = await apiClient.post<ApiResponse<null>>('/api/auth/phone/verify-code', {
    phone: cleanPhone,
    code,
  })
  unwrapVoid(response, '인증 코드 확인에 실패했습니다.')
}

export const completeAdopterRegistration = async (
  data: AdopterRegistrationDto,
): Promise<AuthResponseDto> =>
  apiClient
    .post<ApiResponse<AuthResponseDto>>('/api/auth/social/complete', {
      tempId: data.tempId,
      email: data.email,
      name: data.name,
      role: 'adopter',
      nickname: data.nickname,
      phone: data.phone,
      marketingAgreed: data.marketingAgreed ?? false,
    })
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))

export const completeBreederRegistration = async (
  data: BreederRegistrationDto,
): Promise<AuthResponseDto> =>
  apiClient
    .post<ApiResponse<AuthResponseDto>>('/api/auth/social/complete', {
      ...data,
      role: 'breeder',
    })
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))

export const uploadBreederDocuments = async (
  tempId: string,
  files: { type: string; file: File }[],
  level: 'new' | 'elite',
): Promise<{ documentUrls: string[] }> => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
  formData.append('level', level)

  return apiClient
    .post<ApiResponse<{ documentUrls: string[] }>>('/api/auth/upload-breeder-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { tempId },
    })
    .then((res) => unwrap(res, '서류 업로드에 실패했습니다.'))
}

export const uploadProfileImage = async (
  file: File,
  tempId?: string,
): Promise<{ url: string; filename: string; size: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  const url = tempId
    ? `/api/auth/upload-breeder-profile?tempId=${encodeURIComponent(tempId)}`
    : '/api/auth/upload-breeder-profile'

  return apiClient
    .post<ApiResponse<{ url: string; filename: string; size: number }>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => unwrap(res, '프로필 이미지 업로드에 실패했습니다.'))
}

export const logout = async (): Promise<{ message: string; loggedOutAt: string }> => {
  try {
    const response =
      await apiClient.post<ApiResponse<{ message: string; loggedOutAt: string }>>(
        '/api/auth/logout',
      )
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    return unwrap(response, '로그아웃에 실패했습니다.')
  } catch (error) {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
    throw error
  }
}
