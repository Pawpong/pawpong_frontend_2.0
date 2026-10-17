import type { Metadata } from 'next'
import { MOBILE_APP } from '@/shared/config/mobileApp'
import { SHARE_IMAGE, SITE_URL } from '@/shared/config/site'

/** 어드민 주소도 포퐁 앱의 공식 스토어인지 확인한다. */
export function parseMobileStoreUrl(
  value: unknown,
  platform: 'ios' | 'android',
): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
    if (platform === 'ios') {
      return url.hostname === 'apps.apple.com' &&
        new RegExp(`/id${MOBILE_APP.ios.appId}/?$`).test(url.pathname)
        ? url.href
        : undefined
    }
    return url.hostname === 'play.google.com' &&
      url.pathname === '/store/apps/details' &&
      url.searchParams.get('id') === MOBILE_APP.android.packageName &&
      url.searchParams.getAll('id').length === 1
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

/** 버전 설정이 비어 있거나 일시 실패해도 출시된 공식 앱으로 안내한다. */
export function resolveMobileStoreUrl(value: unknown, platform: 'ios' | 'android'): string {
  return parseMobileStoreUrl(value, platform) ?? MOBILE_APP[platform].storeUrl
}

/** 공개 canonical만 사용한다. 루트 layout/비공개 화면에는 앱 경로를 상속하지 않는다. */
export function createMobileAppMetadata(url: string): Pick<Metadata, 'itunes' | 'appLinks'> {
  return {
    itunes: { appId: MOBILE_APP.ios.appId, appArgument: url },
    appLinks: {
      ios: { url, app_store_id: MOBILE_APP.ios.appId, app_name: MOBILE_APP.name },
      android: { url, package: MOBILE_APP.android.packageName, app_name: MOBILE_APP.name },
      web: { url, should_fallback: true },
    },
  }
}

/** 화면에 안내하는 출시 앱만 기술한다. 평점·리뷰·버전·미출시 기능은 만들지 않는다. */
export function createMobileAppStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': (['ios', 'android'] as const).map((platform) => ({
      '@type': 'MobileApplication',
      '@id': `${SITE_URL}/app#${platform}`,
      name: MOBILE_APP.name,
      url: `${SITE_URL}/app`,
      description: '반려동물 탐색부터 브리더 상담, 일상 공유까지 포퐁에서 함께하세요.',
      operatingSystem: platform === 'ios' ? 'iOS' : 'Android',
      applicationCategory: 'SocialNetworkingApplication',
      inLanguage: 'ko',
      image: SHARE_IMAGE,
      installUrl: MOBILE_APP[platform].storeUrl,
      downloadUrl: MOBILE_APP[platform].storeUrl,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    })),
  }
}
