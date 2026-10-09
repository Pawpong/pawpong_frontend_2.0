import 'server-only'
import type { ApiResponseFull, BannerDto } from '@/shared/types'

/** 서버에서 미리 받은 배너와 받은 시각. 클라이언트 캐시의 신선도 계산에 함께 쓴다. */
export interface InitialBanners {
  banners: BannerDto[]
  fetchedAt: number
}

// 배너는 관리자만 바꾸므로 1분 동안 같은 HTML 을 재사용한다. 서명 이미지 주소는 하루 동안 유효하다.
const BANNER_REVALIDATE_SECONDS = 60
// 1분 재검증은 사용자 요청을 기다리게 하지 않는 백그라운드 재생성이라 공유 메타 조회와 같은 3초를 준다.
// 1.5초로는 배포 빌드 때 받지 못해 첫 재검증 전까지 배너 없는 HTML 이 나갔다.
const BANNER_TIMEOUT_MS = 3000

/**
 * 홈 첫 배너를 HTML 에 바로 싣기 위한 익명 조회.
 * 브라우저가 화면 코드를 받고 배너 API 를 다시 부른 뒤에야 이미지를 요청하던 순서를 없앤다.
 * 실패하면 null 을 돌려 기존 클라이언트 조회로 그대로 동작한다.
 */
export async function getInitialBanners(): Promise<InitialBanners | null> {
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!origin) return null
  try {
    const response = await fetch(`${origin.replace(/\/+$/, '')}/api/v2/home/banners`, {
      credentials: 'omit',
      next: { revalidate: BANNER_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(BANNER_TIMEOUT_MS),
    })
    if (!response.ok) return null
    const body: ApiResponseFull<BannerDto[]> = await response.json()
    if (!body.success || !Array.isArray(body.data)) return null
    return { banners: body.data, fetchedAt: Date.now() }
  } catch {
    return null
  }
}
