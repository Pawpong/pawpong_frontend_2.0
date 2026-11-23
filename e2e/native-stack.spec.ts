import { devices, expect, test, type Page } from '@playwright/test'

// iOS 앱이 상세(브리더 홈·분양 상세)를 새 화면으로 쌓을 때 웹과의 약속을 확인한다 (shared/lib/nativeStack, app/_lib/NativeStackSync).
// 앱 1.0.4 가 쓰는 약속이라, 웹 배포가 실제 Next 라우터 위에서 이걸 깨면 운영 반영 전에 막아야 한다.
// 브라우저가 앱인 척한다: UA 에 PawpongStack/1 을 붙이고, 앱이 받는 postMessage 를 가짜 ReactNativeWebView 로 모은다.
// 상세 화면은 앱이 문서 시작 전에 __PAWPONG_STACK_LAYER__ = 'detail' 을 심은 WebView 다.

type Sent = { type: string; [key: string]: unknown }
const sentMessages = (page: Page) =>
  page.evaluate(() => (window as Window & { __sent?: Sent[] }).__sent ?? [])
const lastOf = async (page: Page, type: string) =>
  (await sentMessages(page)).filter((m) => m.type === type).at(-1)
const sendFromApp = (page: Page, message: Sent) =>
  page.evaluate((data) => window.postMessage(JSON.stringify(data), '*'), message)

const fakeApp = (page: Page, layer?: 'detail') =>
  page.addInitScript((detail) => {
    const sent: unknown[] = []
    Object.assign(window, {
      __sent: sent,
      ReactNativeWebView: { postMessage: (message: string) => sent.push(JSON.parse(message)) },
      ...(detail ? { __PAWPONG_STACK_LAYER__: 'detail' } : {}),
    })
  }, layer === 'detail')

// 브리더 홈 링크 — 운영에도 브리더는 있다(분양글은 0건일 수 있다). 탐색 카드에서 고른다
const breederLink = (page: Page) =>
  page.locator('a[href^="/home/"]').filter({ visible: true }).first()

test.use({
  userAgent: `${devices['iPhone 15 Pro'].userAgent} PawpongApp/iOS PawpongTabs/1 PawpongStack/1`,
})

test('목록에서 상세 링크를 누르면 목록은 그대로 두고 앱에 새 화면을 연다', async ({ page }) => {
  await fakeApp(page)
  await page.goto('/explore?type=breeder')
  const href = await breederLink(page).getAttribute('href')
  await breederLink(page).click()

  await expect.poll(() => lastOf(page, 'OPEN_SCREEN')).toEqual({ type: 'OPEN_SCREEN', href })
  // 목록 문서는 이동하지 않는다 (뒤로 오면 목록이 그대로 있어야 한다)
  await page.waitForTimeout(500)
  expect(new URL(page.url()).pathname).toBe('/explore')
})

test('상세 화면: 열기 → 안에서 이동 → 뒤로 → 닫기까지 처음 연 화면인지 앱에 알린다', async ({
  page,
}) => {
  await fakeApp(page, 'detail')
  await page.goto('/explore?type=breeder')
  const href = (await breederLink(page).getAttribute('href')) as string

  // 앱이 미리 띄워 둔 대기 화면
  await page.goto('/app-shell')
  await expect.poll(() => lastOf(page, 'STACK_READY')).toBeTruthy()

  // 상세를 연다 — 대기 화면 자리를 바꿔 끼우므로 여기가 처음 연 화면이다
  await sendFromApp(page, { type: 'STACK_NAVIGATE', href })
  await page.waitForURL((url) => url.pathname === href)
  await expect.poll(() => lastOf(page, 'STACK_ROUTE')).toMatchObject({ url: href, atBase: true })

  // 상세 안에서 한 번 더 들어가면 처음 연 화면이 아니다 (여기서 뒤로는 웹 뒤로).
  // 남의 홈은 모바일에서 자기 상단 바만 두어(로고 바 없음, #645) 안에서 갈 곳은 분양글 카드뿐이다.
  // 분양글이 없는 브리더(운영은 2026-11 기준 0건)면 이 단계만 건너뛴다 — dev 배포 E2E 가 확인한다.
  const listing = page.locator('a[href^="/adoption/"]').filter({ visible: true }).first()
  const hasListing = await listing
    .waitFor({ timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (hasListing) {
    const inner = (await listing.getAttribute('href')) as string
    await listing.click()
    await page.waitForURL((url) => url.pathname === inner)
    await expect
      .poll(() => lastOf(page, 'STACK_ROUTE'))
      .toMatchObject({ url: inner, atBase: false })

    // 뒤로 오면 다시 처음 연 화면이다 (여기서 뒤로는 앱이 화면을 닫는다)
    await page.goBack()
    await page.waitForURL((url) => url.pathname === href)
    await expect.poll(() => lastOf(page, 'STACK_ROUTE')).toMatchObject({ url: href, atBase: true })
  } else {
    test
      .info()
      .annotations.push({ type: 'skip-step', description: '분양글이 없어 안에서 이동은 건너뜀' })
  }

  // 화면의 뒤로 버튼은 판단을 앱에 맡긴다
  await page.getByRole('button', { name: '뒤로 가기' }).click()
  await expect.poll(() => lastOf(page, 'BACK')).toEqual({ type: 'BACK' })

  // 앱이 닫으면 대기 화면으로 돌아가 다음 상세를 기다린다
  await sendFromApp(page, { type: 'STACK_RESET' })
  await page.waitForURL((url) => url.pathname === '/app-shell')
})
