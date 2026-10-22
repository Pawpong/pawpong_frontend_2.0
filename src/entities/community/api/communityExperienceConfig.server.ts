import 'server-only'
import type { ApiResponseFull } from '@/shared/types'
import {
  parseCommunityExperienceConfig,
  type CommunityExperienceConfig,
} from '../model/communityExperience'

/** 서버에서 미리 받은 커뮤니티 확장 기능 설정과 받은 시각. 클라이언트 캐시의 신선도 계산에 함께 쓴다. */
export interface InitialCommunityExperience {
  config: CommunityExperienceConfig
  fetchedAt: number
}

// 켜짐 여부는 사람마다 다르지 않고 운영 설정으로만 바뀌어 1분 동안 같은 값을 재사용한다.
const REVALIDATE_SECONDS = 60
// 홈 배너와 같은 3초 — 재검증은 백그라운드라 사용자 요청을 기다리게 하지 않는다.
const TIMEOUT_MS = 3000

/**
 * 커뮤니티 카테고리·말머리 줄을 첫 HTML 에 바로 그리기 위한 설정 조회.
 * 브라우저가 화면 코드를 받은 뒤 설정을 다시 물어야 줄이 생기던 순서를 없앤다.
 * 실패하면 null 을 돌려 기존 클라이언트 조회로 그대로 동작한다.
 */
export async function getInitialCommunityExperience(): Promise<InitialCommunityExperience | null> {
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!origin) return null
  try {
    const response = await fetch(
      `${origin.replace(/\/+$/, '')}/api/v2/community/experience/config`,
      {
        credentials: 'omit',
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    )
    if (!response.ok) return null
    const body: ApiResponseFull<Partial<CommunityExperienceConfig>> = await response.json()
    const config = body.success ? parseCommunityExperienceConfig(body.data) : null
    return config ? { config, fetchedAt: Date.now() } : null
  } catch {
    return null
  }
}
