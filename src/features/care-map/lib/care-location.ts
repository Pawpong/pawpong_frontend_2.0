import type { CareCoordinates } from '@/entities/care-place'

type LocationFailure = 'denied' | 'unavailable' | 'outside-korea'
type LocationCallbacks = {
  onChecking(): void
  onLocated(center: CareCoordinates): void
  onFailure(reason: LocationFailure): void
}
type LocationBrowser = Pick<Navigator, 'permissions' | 'geolocation'>

/** 권한을 새로 요청하지 않는 초기 조회와 명시적인 내 주변 찾기가 같은 취소 경로를 쓴다. */
export function startCareLocation(
  browser: LocationBrowser,
  mode: 'granted-only' | 'manual',
  callbacks: LocationCallbacks,
): () => void {
  let active = true
  let permission: PermissionStatus | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const cancel = () => {
    active = false
    clearTimeout(timer)
    permission?.removeEventListener('change', onPermissionChange)
  }
  const fail = (reason: LocationFailure) => {
    if (!active) return
    cancel()
    callbacks.onFailure(reason)
  }
  const onPermissionChange = () => {
    if (permission?.state !== 'granted') fail('denied')
  }
  const locate = () => {
    if (!active) return
    if (!browser.geolocation) return fail('unavailable')
    callbacks.onChecking()
    clearTimeout(timer)
    // 백그라운드 WebView 등에서 API의 오류 콜백이 오지 않아도 대기 상태를 해제한다.
    timer = setTimeout(() => fail('unavailable'), 10000)
    try {
      browser.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (!active) return
          const { latitude, longitude } = coords
          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < 32 ||
            latitude > 39 ||
            longitude < 123 ||
            longitude > 133
          ) {
            fail('outside-korea')
            return
          }
          cancel()
          callbacks.onLocated({ latitude, longitude })
        },
        (error) => fail(error.code === 1 ? 'denied' : 'unavailable'),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      )
    } catch {
      fail('unavailable')
    }
  }

  if (mode === 'manual') {
    locate()
  } else if (browser.permissions?.query && browser.geolocation) {
    timer = setTimeout(cancel, 2000)
    void Promise.resolve()
      .then(() => browser.permissions.query({ name: 'geolocation' }))
      .then((status) => {
        if (!active) return
        permission = status
        // prompt/denied/unsupported에서는 위치 요청 자체를 하지 않는다.
        if (status.state !== 'granted') return cancel()
        status.addEventListener('change', onPermissionChange)
        locate()
      })
      .catch(cancel)
  }
  return cancel
}

/** inApp이면 앱 WebView라서 브라우저가 아니라 휴대폰 설정의 앱 권한을 안내한다. */
export function careLocationFailureMessage(reason: LocationFailure, inApp = false): string {
  if (reason === 'outside-korea') return '국내 시설을 제공하고 있어요. 찾으실 지역을 선택해 주세요.'
  if (reason === 'denied')
    return inApp
      ? '위치 권한이 꺼져 있어요. 지역을 선택하거나 휴대폰 설정에서 포퐁 앱의 위치 권한을 켜 주세요.'
      : '위치 권한이 꺼져 있어요. 지역을 선택하거나 브라우저에서 위치 권한을 켜 주세요.'
  return '현재 위치를 확인하지 못했어요. 지역을 선택하거나 다시 시도해 주세요.'
}
