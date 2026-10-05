import { apiClient, API_VERSION, type ApiRequestConfig } from '@/shared/api/client'
import { getAccessToken } from '@/shared/api/token'
import { ApiError, unwrap } from '@/shared/api/unwrap'
import type { ApiResponse } from '@/shared/types'
import type {
  EligiblePetImages,
  PetCommand,
  PetConfig,
  PetMutationView,
  PetView,
} from '../model/types'

const BASE = `${API_VERSION}/playground/pet`

/** Bind private requests before Axios's async interceptors; never replay a command under a new account. */
function sessionRequest(signal?: AbortSignal): ApiRequestConfig {
  const token = getAccessToken()
  if (!token) throw new ApiError('로그인이 필요합니다.', 401)
  return { signal, headers: { Authorization: `Bearer ${token}` }, skipAuthRefresh: true }
}

/** 같은 호스트의 서버 gate가 개발 미리보기와 관리자 승인된 운영 공개를 구분한다. */
export async function getPetConfig(signal?: AbortSignal): Promise<PetConfig> {
  const response = await fetch('/api/playground/pet/config', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('반려동물 키우기 이용 여부를 확인하지 못했어요.')
  return response.json()
}

export async function getPet(signal?: AbortSignal): Promise<PetView> {
  return unwrap(await apiClient.get<ApiResponse<PetView>>(`${BASE}/me`, sessionRequest(signal)))
}

export async function getEligiblePetImages(
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<EligiblePetImages> {
  return readEligiblePetImages(cursor, sessionRequest(signal))
}

async function readEligiblePetImages(
  cursor: string | null | undefined,
  config: ApiRequestConfig,
): Promise<EligiblePetImages> {
  return unwrap(
    await apiClient.get<ApiResponse<EligiblePetImages>>(`${BASE}/eligible-images`, {
      ...config,
      params: cursor ? { cursor } : undefined,
    }),
  )
}

export async function runPetCommand(command: PetCommand): Promise<PetMutationView> {
  return unwrap(
    await apiClient.post<ApiResponse<PetMutationView>>(
      `${BASE}/${command.kind}`,
      command.body,
      sessionRequest(),
    ),
  )
}

export async function isEligiblePetImage(
  sourceJobId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const config = sessionRequest(signal)
  let cursor: string | null = null
  const seen = new Set<string>()
  do {
    const page = await readEligiblePetImages(cursor, config)
    if (page.images.some((image) => image.sourceJobId === sourceJobId)) return true
    cursor = page.nextCursor
    if (cursor && seen.has(cursor)) return false
    if (cursor) seen.add(cursor)
  } while (cursor)
  return false
}
