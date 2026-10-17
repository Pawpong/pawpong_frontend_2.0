/** 출시된 포퐁 앱의 공식 식별자. RN versionPolicy 및 공개 스토어에서 확인한 값이다. */
export const MOBILE_APP = {
  name: '포퐁',
  ios: {
    appId: '6814126823',
    bundleId: 'kr.pawpong.app',
    storeUrl: 'https://apps.apple.com/kr/app/id6814126823',
  },
  android: {
    packageName: 'kr.pawpong.app',
    storeUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
  },
} as const
