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
// 로컬에만 두는 시안 페이지는 검사하지 않는다
const files = walk('src').filter((file) => !/\/(dev|home-preview)\//.test(file))
const using = (pattern, scope = /./) =>
  files.filter((file) => scope.test(file) && pattern.test(source(file))).sort()

test('페이지 폭·여백 값은 globals.css 에만 있다 (KREAM 방식 1280 · 좁은 틀 768)', () => {
  const css = source('src/app/globals.css')
  assert.match(css, /--page-max-width: 80rem;\s*--page-narrow-width: 48rem;\s*--page-gutter: 1rem;/)
  assert.match(css, /@media \(min-width: 1024px\) \{\s*:root \{\s*--page-gutter: 2\.5rem;/)
  assert.match(
    css,
    /@utility page-frame \{[^}]*padding: var\(--page-pad-top\) var\(--page-gutter\) var\(--page-pad-bottom\);/,
  )
  assert.match(css, /@utility page-shell \{[^}]*padding-inline: var\(--page-gutter\);/)
  // 맨 위 제목 바·탭 바는 틀 위 여백 자리에 붙는다
  assert.match(css, /\.page-frame:has\(\[data-page-top\]\) \{\s*padding-top: 0;/)
  assert.match(source('src/shared/ui/NavigationBar.tsx'), /<div data-page-top /)
  assert.match(source('src/shared/ui/TabBar.tsx'), /data-page-top\s+className=\{cn\('frame-bleed /)
})

test('페이지 틀은 라우트 레이아웃만 씌운다 — 폴더 위치가 곧 틀', () => {
  assert.match(source('src/app/(main)/(page)/layout.tsx'), /<PageFrame>\{children\}<\/PageFrame>/)
  assert.match(
    source('src/app/(main)/(narrow)/layout.tsx'),
    /<PageFrame narrow>\{children\}<\/PageFrame>/,
  )
  assert.match(source('src/app/signup/layout.tsx'), /<PageFrame narrow>\{children\}<\/PageFrame>/)
  assert.deepEqual(
    using(/<PageFrame\b|\bpage-frame\b/, /^src\/(app|widgets|features|entities)\/.*\.tsx$/),
    [
      'src/app/(main)/(narrow)/layout.tsx',
      'src/app/(main)/(page)/layout.tsx',
      'src/app/signup/layout.tsx',
    ],
  )
})

test('틀 안의 화면·컴포넌트는 틀을 직접 만들지 않는다 (예외는 화면 끝까지 가는 고정 바·상단바·푸터)', () => {
  const inFrame = /^src\/(app\/\(main\)\/\((page|narrow)\)|widgets|features|entities|shared\/ui)\//
  assert.deepEqual(using(/<PageShell\b|["'` ]page-(shell|width)\b/, inFrame), [
    'src/app/(main)/(narrow)/account/content-rights/_ui/AppContentRightsNotice.tsx', // 레이아웃 띠
    'src/app/(main)/(narrow)/adoption/application-form/_ui/ApplicationFormContent.tsx', // 하단 고정 바
    'src/app/(main)/(narrow)/profile/edit/_ui/ProfileEditContent.tsx', // 하단 고정 바
    'src/app/(main)/(narrow)/profile/verification/_ui/VerificationContent.tsx', // 하단 고정 바
    'src/app/(main)/(narrow)/settings/_ui/SettingsContent.tsx', // 하단 고정 알림
    'src/app/(main)/(page)/adoption/[id]/apply/_ui/FormFields.tsx', // 하단 고정 바
    'src/features/category-browse/ui/CategoryBrowse.tsx', // 띠 페이지(홈) 섹션
    'src/shared/ui/FooterCtaBar.tsx', // 하단 고정 바
    'src/shared/ui/PageShell.tsx',
    'src/shared/ui/ShowcaseSection.tsx', // 띠 페이지(홈) 섹션
    'src/widgets/gnb/ui/Gnb.tsx', // 상단바
    'src/widgets/gnb/ui/MobileMenu.tsx', // 상단바 메뉴
    'src/widgets/hall-of-fame/ui/HallOfFame.tsx', // 띠 페이지(홈) 섹션
    'src/widgets/site-footer/ui/SiteFooter.tsx', // 푸터
  ])
})

test('옛 틀 부품·복제 패턴은 남지 않는다', () => {
  assert.deepEqual(
    using(/\bContainer\b(?!Props)(?=[\s,}>])/, /^src\/.*\.tsx?$/).filter(
      (file) => !/StepContainer/.test(source(file)),
    ),
    [],
  )
  assert.deepEqual(
    using(
      /RESPONSIVE_SHELL_CLASS|PAGE_WIDTH_CLASS|tab:px-12[^"'`]*pc:px-20|max-w-\[(68|80|86|90)rem\][^"'`]*px-5/,
    ),
    [],
  )
})

test('홈 섹션은 공통 글자·간격 토큰을 쓴다 (제목 TEXT.title · 설명 text-body-s · 간격 section-stack)', () => {
  const css = source('src/app/globals.css')
  assert.match(css, /--section-space: 3rem;\s*--section-head-gap: 1rem;/)
  assert.match(css, /@utility section-stack \{[^}]*gap: var\(--section-space\);/)
  const header = source('src/app/(main)/_ui/home/HomeSectionHeader.tsx')
  assert.match(header, /TEXT\.title/)
  assert.match(header, /size="responsive"/)
  // 페이지 안 섹션 제목(20 → 24)은 손으로 적지 않고 TEXT.title 하나를 쓴다
  assert.deepEqual(
    files.filter((file) => /font-cafe24 text-xl text-neutral-850 tab:text-2xl/.test(source(file))),
    [],
  )
  assert.match(header, /text-body-s/)
  assert.match(header, /<DetailLink /)
  const home = ['HomeContent.tsx', 'PreviewFeeds.tsx'].map((file) =>
    source(`src/app/(main)/_ui/home/${file}`),
  )
  assert.match(home[0], /className="section-stack"/)
  for (const file of home) {
    // 화면마다 직접 적던 제목 크기·섹션 여백이 돌아오지 않게 한다
    assert.doesNotMatch(file, /text-2xl leading-\[1\.4\]|py-12 tab:py-16|pb-12 tab:pb-16/)
    assert.doesNotMatch(file, /<h2 [^>]*className=/)
  }
})
