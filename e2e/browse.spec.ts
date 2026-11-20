import { expect, test, type Page } from '@playwright/test'

// 서비스의 핵심 동선을 실제 데이터로 따라간다. 보기만 하므로 운영에서도 돈다.

// 목록 카드는 데이터가 온 뒤에 그려지므로, 맞는 링크가 나타날 때까지 기다린다 (머리글 링크는 먼저 뜬다)
const firstHref = async (page: Page, pattern: RegExp) => {
  let href: string | undefined
  await expect
    .poll(
      async () => {
        const hrefs = await page
          .locator('a[href]')
          .filter({ visible: true })
          .evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''))
        href = hrefs.find((value) => pattern.test(value))
        return href
      },
      { message: `${pattern} 에 맞는 링크가 없다` },
    )
    .toBeTruthy()
  return href as string
}

// 카카오톡·메신저에 붙인 링크의 미리보기가 비지 않아야 한다
const expectShareMeta = async (page: Page) => {
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//)
}

test('탐색 → 분양 상세 → 브리더 홈', async ({ page }) => {
  await page.goto('/explore?type=adoption')
  // 분양글이 하나도 없으면(운영은 2026-11 기준 0건) 빈 화면이 제대로 뜨는 것까지만 본다
  const empty = page.getByText('분양글이 없어요')
  const card = page.locator('a[href^="/adoption/"]:not([href="/adoption/create"])')
  await expect(card.or(empty).first()).toBeVisible()
  test.skip(await empty.isVisible(), '분양글이 없어 상세 흐름은 건너뛴다')

  const pet = await firstHref(page, /^\/adoption\/(?!create$)[\w-]+$/)
  await page.locator(`a[href="${pet}"]`).first().click()
  await page.waitForURL((url) => url.pathname === pet)
  await expectShareMeta(page)

  const breeder = await firstHref(page, /^\/home\/[\w-]+$/)
  await page.locator(`a[href="${breeder}"]`).first().click()
  await page.waitForURL((url) => url.pathname === breeder)
})

test('브리더 탐색 → 브리더 홈', async ({ page }) => {
  await page.goto('/explore?type=breeder')
  const breeder = await firstHref(page, /^\/home\/[\w-]+$/)
  await page.locator(`a[href="${breeder}"]`).first().click()
  await page.waitForURL((url) => url.pathname === breeder)
})

test('커뮤니티 목록 → 글 상세', async ({ page }) => {
  await page.goto('/community')
  const post = await firstHref(page, /^\/community\/post\/[\w-]+$/)
  await page.locator(`a[href="${post}"]`).first().click()
  // 목록에서는 모달(@modal)로 열려도 주소는 글 상세다
  await page.waitForURL((url) => url.pathname === post)

  // 링크로 바로 들어온 사람에게도 글과 공유 미리보기가 보인다
  await page.goto(post)
  await expectShareMeta(page)
})
