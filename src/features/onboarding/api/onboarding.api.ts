import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ApiResponse,
  BreederUploadDocumentType,
  RegisterAdopterRequest,
  RegisterBreederRequest,
  RegisterTokens,
  UploadBreederDocumentsResponse,
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
): Promise<UploadBreederDocumentsResponse> => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
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

export const registerAdopter = async (data: RegisterAdopterRequest): Promise<RegisterTokens> =>
  apiClient
    .post<ApiResponse<RegisterTokens>>(`${API_VERSION}/auth/register/adopter`, data)
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))

export const registerBreeder = async (data: RegisterBreederRequest): Promise<RegisterTokens> =>
  apiClient
    .post<ApiResponse<RegisterTokens>>(`${API_VERSION}/auth/register/breeder`, data)
    .then((res) => unwrap(res, '회원가입에 실패했습니다.'))
