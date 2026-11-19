import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

// 앱은 iOS WKWebView 로 웹을 띄우므로 같은 엔진인 WebKit + iPhone 뷰포트로 돌린다.
// 기본은 운영 빌드(next build && next start)로 확인한다. 이미 떠 있는 서버를 쓰려면 E2E_BASE_URL 을 준다.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    ...devices['iPhone 15 Pro'],
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 600_000,
      },
})
