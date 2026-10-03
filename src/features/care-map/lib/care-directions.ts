import type { CarePlace } from '@/entities/care-place'

export type CareDirectionsLink = {
  provider: 'kakao' | 'naver' | 'google'
  label: string
  webUrl: string
  appIntent?: string
}

export function getCareDirections(
  place: Pick<CarePlace, 'name' | 'latitude' | 'longitude'>,
): CareDirectionsLink[] {
  const { name, latitude, longitude } = place
  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 32 ||
    latitude > 39 ||
    longitude < 123 ||
    longitude > 132
  )
    return []
  const encodedName = encodeURIComponent(name)
  // 공식 nmap 규격은 WGS84 좌표와 URL 인코딩된 시설명을 받는다.
  // https://guide.ncloud-docs.com/docs/maps-url-scheme
  const naverQuery = new URLSearchParams({
    dlat: String(latitude),
    dlng: String(longitude),
    dname: name,
    appname: 'kr.pawpong.app',
  })
    .toString()
    .replace(/\+/g, '%20')
  // 네이버의 기존 웹 주소는 현재 /p/directions로 전달된다(실제 도착지 확인).
  // 공식적으로 고정된 PC URL 계약은 아니므로 이 주소만 별도로 유지한다.
  const naverWeb = `https://map.naver.com/index.nhn?${new URLSearchParams({
    elng: String(longitude),
    elat: String(latitude),
    etext: name,
    menu: 'route',
    pathType: '1',
  })}`
  return [
    {
      provider: 'kakao',
      label: '카카오맵',
      // https://apis.map.kakao.com/web/guide/#routeurl
      webUrl: `https://map.kakao.com/link/to/${encodedName},${latitude},${longitude}`,
    },
    {
      provider: 'naver',
      label: '네이버맵',
      webUrl: naverWeb,
      // RN 외부 링크 처리기가 허용된 스킴을 열고 미지원/미설치 시 HTTPS fallback을 연다.
      appIntent: `intent://route/car?${naverQuery}#Intent;scheme=nmap;package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(naverWeb)};end`,
    },
    {
      provider: 'google',
      label: '구글맵',
      // Google은 임의의 시설명+좌표 조합이 아닌 정확한 좌표를 목적지로 받는다.
      // https://developers.google.com/maps/documentation/urls/get-started#directions-action
      webUrl: `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: `${latitude},${longitude}` })}`,
    },
  ]
}

export function careDirectionsHref(link: CareDirectionsLink, nativeApp: boolean): string {
  return nativeApp && link.appIntent ? link.appIntent : link.webUrl
}
