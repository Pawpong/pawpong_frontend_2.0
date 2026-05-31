import { apiClient, API_VERSION, unwrap, unwrapNullable } from '@/shared/api'
import type {
  ProfileUpdateRequestDto,
  BreederProfileUpdateResponseDto,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ChatMessageDto,
  SendChatMessageRequest,
} from '@/shared/types'

/** 브리더 프로필 수정 */
export const updateBreederProfile = (data: ProfileUpdateRequestDto) =>
  apiClient
    .patch<{
      success: boolean
      data: BreederProfileUpdateResponseDto
      message?: string
    }>(`${API_VERSION}/breeder-management/profile`, data)
    .then(unwrap)

/** 신청 상태 변경 (브리더용) */
export const updateBreederApplicationStatus = (
  applicationId: string,
  data: ApplicationStatusUpdateRequest,
) =>
  apiClient
    .patch<{
      success: boolean
      data: ApplicationStatusUpdateResponseDto
      message?: string
    }>(`${API_VERSION}/breeder-management/applications/${applicationId}`, data)
    .then(unwrap)

/** 채팅 메시지 전송 */
export const sendApplicationChatMessage = (applicationId: string, data: SendChatMessageRequest) =>
  apiClient
    .post<{
      success: boolean
      data: ChatMessageDto | null
      message?: string
    }>(`${API_VERSION}/breeder-management/applications/${applicationId}/chat/messages`, data)
    .then((res) => unwrapNullable(res, '채팅 메시지 전송에 실패했습니다.'))
