const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, globals = {}, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', ...Object.keys(globals), code)(
    output,
    (name) => dependencies[name],
    ...Object.values(globals),
  )
  return output
}
const mobileConfig = load('src/shared/config/mobileApp.ts')
const site = load('src/shared/config/site.ts')
const mobile = load(
  'src/shared/lib/mobileApp.ts',
  {},
  {
    '@/shared/config/mobileApp': mobileConfig,
    '@/shared/config/site': site,
  },
)
const helpers = load(
  'src/app/l/[slug]/_lib/landing.ts',
  {},
  {
    '@/shared/config/mobileApp': mobileConfig,
    '@/shared/lib/mobileApp': mobile,
  },
)
const validLink = {
  slug: 'welcome-2026',
  title: '새 가족 찾기',
  description: '포퐁에서 만나요',
  targetPath: '/explore?animal=dog',
  imageUrl: '',
}
function getRoute(fetch) {
  return load(
    'src/app/l/[slug]/route.ts',
    { fetch },
    {
      './_lib/landing': helpers,
      '@/shared/lib/mobileApp': mobile,
    },
  ).GET
}
const request = (ua = 'Safari') =>
  new Request('https://pawpong.kr/l/welcome-2026', { headers: { 'user-agent': ua } })
const params = { params: Promise.resolve({ slug: 'welcome-2026' }) }
const json = (data, status = 200) => Response.json({ success: status === 200, data }, { status })

test('rejects external, encoded, recursive and privileged link destinations', () => {
  for (const unsafe of [
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/%2fevil.example',
    '/%252fevil.example',
    '/explore%0a',
    '/l/another',
    '/%6c/another',
    '/api/auth/refresh',
    '/_next/file',
    '/admin',
    '/a/../l/again',
    '/a/%2e%2e/explore',
    '/bad%ZZ',
  ]) {
    assert.equal(helpers.isSafeTargetPath(unsafe), false, unsafe)
  }
  for (const safe of [
    '/',
    '/ai-filter',
    '/explore?animal=dog',
    '/notices/123',
    '/community/post/abc#comments',
  ])
    assert.equal(helpers.isSafeTargetPath(safe), true, safe)
})

test('HTML contains escaped metadata and usable link actions before JavaScript runs', async () => {
  const calls = []
  const get = getRoute(async (url, options) => {
    calls.push({ url, options })
    if (url.includes('/deep-links/'))
      return json({
        ...validLink,
        title: '"><script>alert(1)</script>',
        description: '<img src=x onerror=alert(1)>',
        imageUrl: 'javascript:alert(1)',
      })
    return json({
      storeUrl: url.includes('platform=ios')
        ? 'https://apps.apple.com/kr/app/id6814126823'
        : 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
    })
  })
  const response = await get(request('Twitterbot'), params)
  const html = await response.text()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.match(response.headers.get('content-security-policy'), /default-src 'none'/)
  assert.match(
    html,
    /property="og:title" content="&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;"/,
  )
  assert.match(html, /href="pawpong:\/\/l\/welcome-2026"/)
  assert.match(html, /href="\/explore\?animal=dog"/)
  assert.match(html, /App Store에서 받기/)
  assert.match(html, /Google Play에서 받기/)
  assert.match(response.headers.get('content-security-policy'), /script-src 'self'/)
  const scriptTag = '<script src="/scripts/deep-link-open.js" defer></script>'
  assert.ok(html.includes(scriptTag))
  assert.doesNotMatch(html.replace(scriptTag, ''), /<script|<img src=x|javascript:/)
  assert.match(html, /data-ios-store="https:\/\/apps.apple.com\/kr\/app\/id6814126823"/)
  assert.match(
    html,
    /name="apple-itunes-app" content="app-id=6814126823, app-argument=https:\/\/pawpong.kr\/l\/welcome-2026"/,
  )
  assert.match(html, /property="al:android:package" content="kr.pawpong.app"/)
  assert.match(
    html,
    /data-android-store="https:\/\/play.google.com\/store\/apps\/details\?id=kr.pawpong.app"/,
  )
  assert.equal(calls.length, 3)
  assert.ok(
    calls.every(
      ({ options }) => options.cache === 'no-store' && options.signal instanceof AbortSignal,
    ),
  )
})

test('Android intent uses configured Pawpong store or the verified released store fallback', async () => {
  let store = 'https://play.google.com/store/apps/details?id=kr.pawpong.app'
  const get = getRoute(async (url) =>
    json(url.includes('/deep-links/') ? validLink : { storeUrl: store }),
  )
  let html = await (await get(request('Android Chrome'), params)).text()
  assert.match(html, /intent:\/\/l\/welcome-2026#Intent;scheme=pawpong;package=kr.pawpong.app/)
  assert.match(html, /S.browser_fallback_url=https%3A%2F%2Fplay.google.com/)
  store = 'https://play.google.com.evil.example/store/apps/details?id=kr.pawpong.app'
  html = await (await get(request('Android Chrome'), params)).text()
  assert.match(html, /S.browser_fallback_url=https%3A%2F%2Fplay.google.com/)
  assert.doesNotMatch(html, /evil.example/)
  assert.match(html, /Google Play에서 받기/)
  assert.match(html, /App Store에서 받기/)
})

test('released Android store remains available when admin version settings are empty or unavailable', async () => {
  for (const storeData of [{ storeUrl: '' }, undefined]) {
    const get = getRoute(async (url) => {
      if (url.includes('/deep-links/')) return json(validLink)
      if (!storeData) throw new Error('version config unavailable')
      return json(storeData)
    })
    const response = await get(request(), params)
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.match(html, /href="https:\/\/play.google.com\/store\/apps\/details\?id=kr.pawpong.app"/)
    assert.match(html, /href="https:\/\/apps.apple.com\/kr\/app\/id6814126823"/)
    assert.doesNotMatch(html, /다운로드를 준비 중/)
  }
})

test('missing and disabled links return 404; invalid slugs never call backend', async () => {
  let count = 0
  const get = getRoute(async () => {
    count++
    return json(null, 404)
  })
  let response = await get(request(), params)
  assert.equal(response.status, 404)
  assert.match(await response.text(), /사용할 수 없는 링크/)
  count = 0
  response = await get(request(), { params: Promise.resolve({ slug: '../api' }) })
  assert.equal(response.status, 404)
  assert.equal(count, 0)
})

test('backend outage and invalid destination are 503; store outage retains link actions', async () => {
  for (const fetch of [
    async () => {
      throw new Error('offline')
    },
    async () => json({ ...validLink, targetPath: '//evil.example' }),
    async () => json(null, 500),
  ]) {
    const response = await getRoute(fetch)(request(), params)
    assert.equal(response.status, 503)
    assert.doesNotMatch(await response.text(), /pawpong:\/\//)
  }
  const response = await getRoute(async (url) => {
    if (url.includes('/deep-links/')) return json(validLink)
    throw new Error('store unavailable')
  })(request(), params)
  assert.equal(response.status, 200)
  assert.match(await response.text(), /웹으로 보기/)
})

test('store links reject credentials, non HTTPS URLs and unrelated Android packages', () => {
  for (const value of [
    'http://apps.apple.com/kr/app/id123',
    'https://user@apps.apple.com/kr/app/id123',
    'https://evil.example/id123',
    'https://apps.apple.com/kr/app/id123456789',
    'https://apps.apple.com:8443/kr/app/id6814126823',
    'https://apps.apple.com/kr/app/id68141268230',
  ])
    assert.equal(helpers.parseStoreUrl(value, 'ios'), undefined)
  assert.equal(
    helpers.parseStoreUrl('https://play.google.com/store/apps/details?id=another.app', 'android'),
    undefined,
  )
  assert.equal(
    helpers.parseStoreUrl(
      'https://play.google.com/store/apps/details?id=kr.pawpong.app&id=another.app',
      'android',
    ),
    undefined,
  )
  assert.equal(
    helpers.parseStoreUrl(
      'https://apps.apple.com/kr/app/%ED%8F%AC%ED%90%81/id6814126823?uo=4',
      'ios',
    ),
    'https://apps.apple.com/kr/app/%ED%8F%AC%ED%90%81/id6814126823?uo=4',
  )
})

test('dev and local links keep their own canonical and fallback origins; unknown hosts cannot redirect', () => {
  assert.equal(
    helpers.getLandingOrigin('https://dev.pawpong.kr/l/test', false),
    'https://dev.pawpong.kr',
  )
  assert.equal(
    helpers.getLandingOrigin('http://10.0.2.2:3017/l/test', true),
    'http://10.0.2.2:3017',
  )
  assert.equal(
    helpers.getLandingOrigin('http://localhost:3017/l/test', false),
    'https://pawpong.kr',
  )
  assert.equal(helpers.getLandingOrigin('https://evil.example/l/test', true), 'https://pawpong.kr')
  const html = helpers.renderLanding(validLink, 'Android', {}, 'https://dev.pawpong.kr')
  assert.match(html, /rel="canonical" href="https:\/\/dev.pawpong.kr\/l\/welcome-2026"/)
  assert.match(html, /S.browser_fallback_url=https%3A%2F%2Fdev.pawpong.kr%2Fexplore/)
  assert.doesNotMatch(html, /apple-itunes-app|al:ios|al:android/)
})

test('Next wildcard listen address uses only a validated Host for local canonical links', () => {
  assert.equal(
    helpers.getLandingOrigin('http://0.0.0.0:3017/l/test', true, 'localhost:3017'),
    'http://localhost:3017',
  )
  assert.equal(
    helpers.getLandingOrigin('http://0.0.0.0:3017/l/test', true, 'evil.example'),
    'https://pawpong.kr',
  )
})
