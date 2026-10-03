import { apiClient, API_VERSION } from '@/shared/api/client'
import { unwrap } from '@/shared/api/unwrap'
import type { ApiResponse } from '@/shared/types'
import type {
  EligiblePetImages,
  PetCommand,
  PetConfig,
  PetMutationView,
  PetView,
} from '../model/types'

const BASE = `${API_VERSION}/playground/pet`

/** 같은 호스트의 서버 gate를 먼저 거친다. 운영 빌드/호스트에서는 백엔드 조회도 하지 않는다. */
export async function getPetConfig(signal?: AbortSignal): Promise<PetConfig> {
  const response = await fetch('/api/playground/pet/config', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('반려동물 키우기 이용 여부를 확인하지 못했어요.')
  return response.json()
}

export async function getPet(signal?: AbortSignal): Promise<PetView> {
  return unwrap(await apiClient.get<ApiResponse<PetView>>(`${BASE}/me`, { signal }))
}

export async function getEligiblePetImages(
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<EligiblePetImages> {
  return unwrap(
    await apiClient.get<ApiResponse<EligiblePetImages>>(`${BASE}/eligible-images`, {
      params: cursor ? { cursor } : undefined,
      signal,
    }),
  )
}

export async function runPetCommand(command: PetCommand): Promise<PetMutationView> {
  return unwrap(
    await apiClient.post<ApiResponse<PetMutationView>>(`${BASE}/${command.kind}`, command.body),
  )
}

export async function isEligiblePetImage(
  sourceJobId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  let cursor: string | null = null
  const seen = new Set<string>()
  do {
    const page = await getEligiblePetImages(cursor, signal)
    if (page.images.some((image) => image.sourceJobId === sourceJobId)) return true
    cursor = page.nextCursor
    if (cursor && seen.has(cursor)) return false
    if (cursor) seen.add(cursor)
  } while (cursor)
  return false
}
