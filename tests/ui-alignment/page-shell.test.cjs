const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readdirSync, statSync } = require('node:fs')
const { join } = require('node:path')
const { source } = require('./fixtures/alignment.fixture.cjs')

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : /\.(tsx?|css)$/.test(name) ? [path] : []
  })

test('페이지 폭·좌우 여백은 globals.css 두 변수에서만 정하고 상단바·Container 가 같은 틀을 씀', () => {
  const css = source('src/app/globals.css')
  // KREAM 방식: 1280 상자(여백 포함) + 1024px 미만 16px / 이상 40px
  assert.match(css, /--page-max-width: 80rem;\s*--page-gutter: 1rem;/)
  assert.match(css, /@media \(min-width: 1024px\) \{\s*:root \{\s*--page-gutter: 2\.5rem;/)
  assert.match(
    css,
    /@utility page-shell \{[^}]*max-width: var\(--page-max-width\);[^}]*padding-inline: var\(--page-gutter\);/,
  )
  assert.match(source('src/shared/ui/Container.tsx'), /cn\('page-shell', className\)/)
  assert.match(source('src/widgets/gnb/ui/Gnb.tsx'), /className="page-shell flex/)
})

test('화면마다 페이지 틀을 직접 만들지 않음 (옛 셸 상수·상단바 여백 복제 금지)', () => {
  // 로컬에만 두는 시안 페이지는 검사하지 않는다
  const files = walk('src').filter((file) => !/\/(dev|home-preview)\//.test(file))
  const offenders = files.filter((file) =>
    /RESPONSIVE_SHELL_CLASS|PAGE_WIDTH_CLASS|tab:px-12[^"'`]*pc:px-20|max-w-\[(68|80|86|90)rem\][^"'`]*px-5/.test(
      source(file),
    ),
  )
  assert.deepEqual(offenders, [])
})
