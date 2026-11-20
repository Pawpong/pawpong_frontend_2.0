import { expect, test } from '@playwright/test'

// 심사용 계정으로 로그인해 로그인이 필요한 화면까지 들어간다. 소셜 로그인은 외부 화면이라 자동으로 확인할 수 없다.
// 계정은 저장소에 두지 않고 E2E_REVIEW_EMAIL·E2E_REVIEW_PASSWORD (GitHub secret) 로만 받는다. 없으면 건너뛴다.
const email = process.env.E2E_REVIEW_EMAIL
const password = process.env.E2E_REVIEW_PASSWORD

test('심사용 계정으로 로그인하면 마이홈에 들어간다', async ({ page }) => {
  test.skip(!email || !password, 'E2E_REVIEW_EMAIL·E2E_REVIEW_PASSWORD 가 없다')

  await page.goto('/login/review?returnUrl=%2Fhome')
  await page.getByLabel('이메일').fill(email as string)
  await page.getByLabel('비밀번호').fill(password as string)
  await page.getByRole('button', { name: '심사용 계정으로 로그인' }).click()

  await page.waitForURL((url) => url.pathname === '/home')
  // 다시 열어도 로그인 화면으로 튕기지 않는다 (서버가 쿠키를 읽는다)
  await page.reload()
  expect(new URL(page.url()).pathname).toBe('/home')
})
