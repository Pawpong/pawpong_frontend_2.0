import { expect, test } from '@playwright/test'

// 탐색 조건은 URL 이 단일 출처다 — 고르면 URL 에 남고, 뒤로가기는 직전 조건으로 돌아간다.
// 보기만 하는 흐름이라 운영에서도 돈다.
test('입양 탐색 필터 칩을 고르면 URL 에 남고 뒤로가기로 직전 조건이 돌아온다', async ({ page }) => {
  await page.goto('/explore?type=adoption', { waitUntil: 'domcontentloaded' })

  await page.getByRole('combobox', { name: '분양 상태' }).click()
  await page.getByRole('option', { name: '분양중' }).click()
  await expect(page).toHaveURL(/status=available/)
  await expect(page.getByRole('combobox', { name: '분양 상태' })).toHaveText(/분양중/)

  await page.getByRole('combobox', { name: '정렬' }).click()
  await page.getByRole('option', { name: '최신순' }).click()
  await expect(page).toHaveURL(/sort=latest/)

  await page.goBack()
  await expect(page).not.toHaveURL(/sort=latest/)
  await expect(page).toHaveURL(/status=available/)
  await expect(page.getByRole('combobox', { name: '정렬' })).toHaveText(/인기순/)
})

test('브리더 탐색에서만 지역 칩이 보인다', async ({ page }) => {
  await page.goto('/explore?type=breeder', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('combobox', { name: '지역' })).toBeVisible()

  await page.getByRole('tab', { name: '입양 탐색' }).click()
  await expect(page).toHaveURL(/type=adoption/)
  await expect(page.getByRole('combobox', { name: '지역' })).toHaveCount(0)
})

test('헤더 돋보기로 검색하면 검색어가 URL 에 남고, 검색을 닫으면 풀린다', async ({ page }) => {
  await page.goto('/explore?type=adoption', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: '검색', exact: true }).click()
  const input = page.getByRole('textbox', { name: '검색해서 원하는 동물 찾기' })
  await expect(input).toBeFocused()
  await input.fill('푸들')
  await input.press('Enter')
  await expect(page).toHaveURL(/keyword=%ED%91%B8%EB%93%A4/)

  await page.getByRole('button', { name: '검색 닫기' }).click()
  await expect(page).not.toHaveURL(/keyword=/)
})
