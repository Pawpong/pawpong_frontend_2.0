import { devices, expect, test, type Page } from '@playwright/test'

// 앱(웹뷰)이 하단 탭 바를 직접 그릴 때 웹과의 약속을 확인한다 (shared/lib/nativeBridge, widgets/bottom-nav/NativeTabSync).
// 브라우저가 앱인 척한다: UA 에 PawpongTabs/1 을 붙이고, 앱이 받는 postMessage 를 가짜 ReactNativeWebView 로 모은다.

type Sent = { type: string; [key: string]: unknown }
const sentMessages = (page: Page) =>
  page.evaluate(() => (window as Window & { __sent?: Sent[] }).__sent ?? [])
const lastTabState = async (page: Page) =>
  (await sentMessages(page)).filter((m) => m.type === 'TAB_STATE').at(-1)
const sendFromApp = (page: Page, message: Sent) =>
  page.evaluate((data) => window.postMessage(JSON.stringify(data), '*'), message)

const webNav = (page: Page) => page.getByRole('navigation', { name: '하단 주요 메뉴' })

test.describe('앱 탭 바', () => {
  test.use({ userAgent: `${devices['iPhone 15 Pro'].userAgent} PawpongApp/iOS PawpongTabs/1` })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const sent: unknown[] = []
      Object.assign(window, {
        __sent: sent,
        ReactNativeWebView: { postMessage: (message: string) => sent.push(JSON.parse(message)) },
      })
    })
  })

  test('웹 하단바를 숨기고 탭 구성과 지금 탭을 앱에 보낸다', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => lastTabState(page)).toMatchObject({ href: '/', visible: true })
    await expect(webNav(page)).toBeHidden()

    const config = (await sentMessages(page)).find((m) => m.type === 'TAB_CONFIG')
    expect(config?.tabs).toEqual(
      ['/', '/explore', '/chat', '/community', '/home'].map((href) =>
        expect.objectContaining({ href, label: expect.any(String) }),
      ),
    )
  })

  test('앱이 탭을 누르면 그 화면으로 가고, 지금 탭을 다시 누르면 맨 위로 간다', async ({
    page,
  }) => {
    await page.goto('/')
    await expect.poll(() => lastTabState(page)).toMatchObject({ href: '/' })
    // 홈은 배너·목록이 늦게 들어오며 위쪽 높이가 바뀐다. 다 불러오기 전에 내리면 맨 위로 가는 부드러운 스크롤이
    // 도중에 끊긴다(배포 E2E 에서 1316·2275 에 멈춘 적이 있다, #642).
    await page.waitForLoadState('networkidle')

    // 모바일 WebKit 은 마우스 휠을 지원하지 않는다
    await page.evaluate(() => window.scrollTo(0, 2000))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await sendFromApp(page, { type: 'NAVIGATE_TAB', href: '/' })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

    await sendFromApp(page, { type: 'NAVIGATE_TAB', href: '/community' })
    await page.waitForURL((url) => url.pathname === '/community')
    await expect.poll(() => lastTabState(page)).toMatchObject({ href: '/community', visible: true })
  })

  test('탭에 없는 주소로 가라는 메시지는 무시한다', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => lastTabState(page)).toMatchObject({ href: '/' })
    await sendFromApp(page, { type: 'NAVIGATE_TAB', href: '/settings' })
    await page.waitForTimeout(1000)
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('로그인 화면에서는 앱 탭 바를 숨기라고 알린다', async ({ page }) => {
    await page.goto('/login')
    await expect.poll(() => lastTabState(page)).toMatchObject({ href: null, visible: false })
  })
})

test('브라우저에서는 웹 하단바로 탭을 옮긴다', async ({ page }) => {
  await page.goto('/')
  const nav = webNav(page)
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: '커뮤니티' }).click()
  await page.waitForURL((url) => url.pathname === '/community')
})
