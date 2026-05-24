import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kr.object.iwinv.kr',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: 'colding',
  project: 'pawpong-frontend',
  silent: !process.env.CI,
  widenClientFileUpload: true,
})
