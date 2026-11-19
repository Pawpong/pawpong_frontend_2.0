import { expect, test } from '@playwright/test'

// dev API 데이터·속도에 흔들리지 않도록 FAQ 응답을 고정한다.
const FAQS = [1, 2, 3].map((n) => ({
  faqId: `e2e-${n}`,
  question: `E2E 질문 ${n}`,
  answer: `E2E 답변 ${n}`,
  category: 'service',
  userType: 'adopter',
  order: n,
}))

// 뒤로가기로 돌아온 화면은 캐시 데이터를 그대로 보여줘야 한다.
// 목록이 그려졌다가 사라지면(스켈레톤으로 바뀌면) 사용자에게는 한 번 깜빡이는 것으로 보인다.
test('FAQ 에서 다른 페이지로 갔다가 뒤로가면 목록이 사라지지 않는다', async ({ page }) => {
  let faqRequests = 0
  await page.route('**/home/faqs?*', async (route) => {
    faqRequests += 1
    // 실제 네트워크만큼 늦게 응답해야 데이터를 비운 순간이 프레임 기록에 확실히 잡힌다.
    await new Promise((resolve) => setTimeout(resolve, 300))
    return route.fulfill({
      json: { success: true, code: 200, data: FAQS, timestamp: new Date().toISOString() },
    })
  })

  await page.goto('/faq', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('E2E 질문 1')).toBeVisible()

  // 클라이언트 내비게이션으로 떠나야 Next 히스토리(popstate) 경로를 탄다.
  await page.locator('a[href="/"]').first().click()
  await page.waitForURL((url) => url.pathname === '/')

  // 같은 문서가 유지되므로 window 에 프레임마다 목록 존재 여부를 기록해 둔다.
  await page.evaluate(() => {
    const samples: boolean[] = []
    Object.assign(window, { __faqSamples: samples })
    const tick = () => {
      if (location.pathname === '/faq') samples.push(document.querySelector('details') !== null)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  const requestsBeforeBack = faqRequests
  await page.goBack()
  await expect(page.getByText('E2E 질문 1')).toBeVisible()
  await page.waitForTimeout(1500)

  const samples = await page.evaluate(
    () => (window as Window & { __faqSamples?: boolean[] }).__faqSamples ?? [],
  )
  const firstShown = samples.indexOf(true)
  expect(firstShown).toBeGreaterThanOrEqual(0)
  expect(samples.slice(firstShown)).not.toContain(false)
  // 화면은 유지하되 서버 데이터는 다시 확인한다 (createQuery 의 refetchOnMount: 'always').
  expect(faqRequests).toBeGreaterThan(requestsBeforeBack)
})
