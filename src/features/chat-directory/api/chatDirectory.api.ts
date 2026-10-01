import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'

export type ChatSearchUser = {
  userId: string
  nickname: string
  role: 'adopter' | 'breeder'
  profileImageUrl?: string
}
export type ChatPrivacySettings = { chatSearchAllowed: boolean }

export const searchChatUsers = (nickname: string, signal?: AbortSignal) =>
  apiClient
    .get<
      ApiResponseFull<ChatSearchUser[]>
    >(`${API_VERSION}/chat/users`, { params: { nickname }, signal, timeout: 8_000 })
    .then(unwrap)
export const getChatPrivacySettings = (signal?: AbortSignal) =>
  apiClient
    .get<
      ApiResponseFull<ChatPrivacySettings>
    >(`${API_VERSION}/chat/settings`, { signal, timeout: 8_000 })
    .then(unwrap)
export const updateChatPrivacySettings = (chatSearchAllowed: boolean) =>
  apiClient
    .patch<
      ApiResponseFull<ChatPrivacySettings>
    >(`${API_VERSION}/chat/settings`, { chatSearchAllowed }, { timeout: 8_000 })
    .then(unwrap)
