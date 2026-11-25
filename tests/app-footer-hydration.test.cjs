const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const routePathname = (pathname) =>
  load('src/shared/lib/useRoutePathname.ts', {
    'next/navigation': { usePathname: () => pathname },
  }).useRoutePathname()

test("Vercel ISR 이 홈을 '/index' 로 다시 그려도 레이아웃은 '/' 로 판단함", () => {
  assert.equal(routePathname('/index'), '/')
  assert.equal(routePathname('/'), '/')
  assert.equal(routePathname('/community'), '/community')
})

test('경로로 무엇을 그릴지 정하는 공통 레이아웃은 홈 경로를 맞춘 훅을 씀', () => {
  // 하나라도 usePathname 을 그대로 쓰면 ISR 홈에서 서버·브라우저 결과가 어긋나 <html data-app> 이 지워진다
  for (const file of [
    'src/widgets/site-footer/ui/SiteFooter.tsx',
    'src/widgets/bottom-nav/ui/BottomNav.tsx',
    'src/widgets/gnb/ui/NavBar.tsx',
    'src/widgets/gnb/ui/Gnb.tsx',
  ]) {
    const code = fs.readFileSync(file, 'utf8')
    assert.match(code, /useRoutePathname\(\)/, file)
    assert.doesNotMatch(code, /\busePathname\b/, file)
  }
})

test('하이드레이션이 깨져 <html> 속성이 지워져도 앱 표시를 다시 붙임', () => {
  const layout = fs.readFileSync('src/app/layout.tsx', 'utf8')
  assert.match(layout, /<AppFlagBridge \/>/)
  // 첫 페인트 스크립트와 복구 브리지는 같은 표시 목록(appFlags)을 쓴다 — 한쪽만 표시를 빠뜨리지 않게
  assert.match(layout, /`\$\{APP_FLAGS_SCRIPT\}/)
  assert.match(fs.readFileSync('src/shared/lib/AppFlagBridge.tsx', 'utf8'), /of APP_UA_FLAGS\)/)

  const { APP_FLAGS_SCRIPT } = load('src/shared/lib/appFlags.ts')
  const run = (userAgent) => {
    const dataset = {}
    new Function('navigator', 'document', APP_FLAGS_SCRIPT)(
      { userAgent },
      {
        documentElement: { dataset },
      },
    )
    return dataset
  }
  assert.deepEqual(run('iPhone PawpongApp/iOS PawpongTabs/1 PawpongStack/1'), {
    app: '',
    nativeTabs: '',
    nativeStack: '',
  })
  assert.deepEqual(run('iPhone Safari'), {})
})
