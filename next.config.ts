import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_APP_ENV || 'development',
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
