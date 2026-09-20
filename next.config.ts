import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  // 앱 딥링크 검증 파일.
  // apple-app-site-association 은 확장자가 없어 기본적으로 JSON 으로 서빙되지 않는데,
  // Apple 은 application/json 이 아니면 Universal Links 검증을 실패 처리한다.
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kr.object.iwinv.kr',
      },
      // 로컬/개발 시드 데이터의 placeholder 이미지 (community 시드 게시글 등)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: 'pawpong-mq',
  project: 'pawpong-web-production',
  silent: !process.env.CI,
  widenClientFileUpload: true,
})
