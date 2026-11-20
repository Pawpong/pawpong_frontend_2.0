import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

// 앱은 iOS WKWebView 로 웹을 띄우므로 같은 엔진인 WebKit + iPhone 뷰포트로 돌린다.
// 기본은 운영 빌드(next build && next start)로 확인한다. 이미 떠 있는 서버나 배포 주소를 쓰려면 E2E_BASE_URL 을 준다.
// 배포 후 실행은 .github/workflows/e2e.yml 이 Vercel 이 막 만든 배포 주소로 돌린다.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  // 배포 주소는 첫 화면이 로컬보다 느리다 (기본 5초면 데이터가 오기 전에 실패한다)
  expect: { timeout: 15_000 },
  // 배포 주소는 네트워크를 타므로 한 번은 다시 시도해 일시적인 끊김으로 운영 반영이 막히지 않게 한다
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['iPhone 15 Pro'],
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Vercel 배포 보호를 넘는 헤더. 첫 응답이 쿠키를 심으므로 이후 요청과 API(다른 출처) 요청에는 붙지 않아도 된다.
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' }
      : undefined,
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
