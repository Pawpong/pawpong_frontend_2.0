import { expect, test, type Page } from '@playwright/test'

// 배포된 화면이 열리자마자 깨지지 않는지 본다. 데이터 내용은 보지 않는다 (dev·운영 데이터가 달라도 같은 결과).
const PAGES = [
  '/',
  '/explore?type=adoption',
  '/explore?type=breeder',
  '/community',
  '/hall-of-fame',
  '/faq',
  '/notices',
  '/about',
  '/playground',
  '/login',
]

// 잡히지 않은 스크립트 오류와 hydration 오류만 실패로 본다.
// 비로그인 401·외부 이미지 실패 같은 콘솔 경고는 정상 흐름에서도 나온다.
const collectErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|Minified React error/i.test(message.text()))
      errors.push(message.text())
  })
  return errors
}

for (const path of PAGES) {
  test(`${path} 이 오류 없이 열린다`, async ({ page }) => {
    const errors = collectErrors(page)
    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).not.toBeEmpty()
    // hydration 과 첫 데이터 요청이 끝날 시간
    await page.waitForTimeout(2000)
    // 다음 화면으로 가기 전에 확인한다 — 이동으로 끊긴 요청의 오류가 섞이지 않게
    expect(errors).toEqual([])
  })
}

test('로그인이 필요한 화면은 비로그인이면 로그인으로 보낸다', async ({ page }) => {
  for (const path of ['/home', '/chat', '/settings']) {
    await page.goto(path)
    await page.waitForURL((url) => url.pathname === '/login')
    expect(new URL(page.url()).searchParams.get('returnUrl')).toBe(path)
  }
})
