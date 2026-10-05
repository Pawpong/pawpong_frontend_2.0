const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const load = (file, dependencies = {}, globals = {}) => {
  const output = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  new Function('exports', 'require', ...Object.keys(globals), code)(
    output,
    (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    ...Object.values(globals),
  )
  return output
}
const site = load('src/shared/config/site.ts')
const mobileConfig = load('src/shared/config/mobileApp.ts')
const mobile = load('src/shared/lib/mobileApp.ts', {
  '@/shared/config/site': site,
  '@/shared/config/mobileApp': mobileConfig,
})
const meta = load('src/shared/lib/metadata.ts', {
  '@/shared/config/site': site,
  './mobileApp': mobile,
})
const content = (fetch) =>
  load(
    'src/app/_lib/contentMetadata.ts',
    {
      'server-only': {},
      react: { cache: (fn) => fn },
      '@/shared/lib/metadata': meta,
    },
    { fetch, process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.example.test/' } } },
  )
const response = (data, status = 200) =>
  Response.json({ success: status === 200, data }, { status })

test('default cards contain an absolute canonical, OG and Twitter image', () => {
  const result = meta.createPageMetadata({ title: '커뮤니티', path: '/community' })
  assert.equal(result.alternates.canonical, 'https://pawpong.kr/community')
  assert.equal(result.openGraph.url, result.alternates.canonical)
  assert.equal(result.openGraph.images[0].url, site.SHARE_IMAGE)
  assert.equal(result.twitter.images[0], site.SHARE_IMAGE)
  assert.equal(result.title, '커뮤니티 | 포퐁')
})

test('private screens are noindex and have no user-specific canonical', () => {
  const result = meta.createPageMetadata({ title: '채팅', path: '/chat/secret', noIndex: true })
  assert.deepEqual(result.robots, { index: false, follow: false })
  assert.equal(result.alternates, undefined)
  assert.equal(result.itunes, undefined)
  assert.equal(result.appLinks, undefined)
})

test('public app metadata follows the content permalink for both platforms without root inheritance', () => {
  const url = 'https://pawpong.kr/community/post/abc'
  const result = meta.createPageMetadata({ title: '공개 글', path: '/community/post/abc' })
  assert.deepEqual(result.itunes, { appId: '6814126823', appArgument: url })
  assert.equal(result.appLinks.ios.url, url)
  assert.equal(result.appLinks.ios.app_store_id, '6814126823')
  assert.equal(result.appLinks.android.url, url)
  assert.equal(result.appLinks.android.package, 'kr.pawpong.app')
  assert.equal(result.appLinks.web.should_fallback, true)
  for (const path of [undefined, 'https://evil.example/post']) {
    const result = meta.createPageMetadata({ title: '포퐁', path })
    assert.equal(result.appLinks, undefined)
    assert.equal(result.itunes, undefined)
  }
})

test('both released apps have free download structured data without fabricated review or version', () => {
  const data = mobile.createMobileAppStructuredData()
  assert.equal(data['@context'], 'https://schema.org')
  assert.equal(data['@graph'].length, 2)
  const [ios, android] = data['@graph']
  assert.equal(ios.operatingSystem, 'iOS')
  assert.equal(ios.installUrl, 'https://apps.apple.com/kr/app/id6814126823')
  assert.equal(android.operatingSystem, 'Android')
  assert.equal(android.installUrl, 'https://play.google.com/store/apps/details?id=kr.pawpong.app')
  for (const app of data['@graph']) {
    assert.equal(app['@type'], 'MobileApplication')
    assert.equal(app.url, 'https://pawpong.kr/app')
    assert.equal(app.offers.price, '0')
    assert.equal(app.aggregateRating, undefined)
    assert.equal(app.review, undefined)
    assert.equal(app.softwareVersion, undefined)
  }
})

test('public post metadata fetches anonymously without caching and uses its own permalink', async () => {
  const seen = []
  const api = content(async (url, options) => {
    seen.push({ url, options })
    return response({
      title: '우리 고양이',
      body: '<p>반가워요</p>\n  오늘도',
      photoUrls: ['https://images.example.test/cat.jpg'],
      visibility: 'public',
      status: 'published',
    })
  })
  const result = await api.getPostMetadata('abc')
  assert.equal(result.title, '우리 고양이 | 포퐁')
  assert.equal(result.description, '반가워요 오늘도')
  assert.equal(result.openGraph.url, 'https://pawpong.kr/community/post/abc')
  assert.equal(result.openGraph.images[0].url, 'https://images.example.test/cat.jpg')
  assert.equal(seen[0].url, 'https://api.example.test/api/v2/community/posts/abc')
  assert.equal(seen[0].options.credentials, 'omit')
  assert.equal(seen[0].options.cache, 'no-store')
  assert.equal(seen[0].options.headers, undefined)
})

test('private, followers-only and draft post metadata never contains private text or photos', async () => {
  for (const [visibility, status] of [
    ['private', 'published'],
    ['followers', 'published'],
    ['public', 'draft'],
  ]) {
    const result = await content(async () =>
      response({
        title: 'SECRET',
        body: 'SECRET',
        photoUrls: ['https://secret.test/secret.jpg'],
        visibility,
        status,
      }),
    ).getPostMetadata('secret')
    assert.equal(result.robots.index, false)
    assert.doesNotMatch(JSON.stringify(result), /SECRET|secret\.test/)
    assert.equal(result.openGraph.images[0].url, site.SHARE_IMAGE)
  }
})

test('missing, unauthorized, malformed and unavailable backend responses produce safe fallback', async () => {
  for (const fetch of [
    async () => response(null, 404),
    async () => response(null, 401),
    async () => response(null, 503),
    async () => new Response('not json'),
    async () => {
      throw new Error('timeout')
    },
  ]) {
    const result = await content(fetch).getPostMetadata('missing')
    assert.equal(result.robots.index, false)
    assert.equal(result.openGraph.images[0].url, site.SHARE_IMAGE)
  }
})

test('adopter and breeder homes use public profile data and stable public URLs', async () => {
  for (const breeder of [false, true]) {
    const result = await content(async (url) =>
      breeder && url.includes('/users/')
        ? response(null, 400)
        : response({
            nickname: '포퐁친구',
            bio: '반가워요',
            profileImageUrl: 'https://images.example.test/profile.jpg',
          }),
    ).getProfileMetadata('user123')
    assert.equal(result.title, '포퐁친구님의 홈 | 포퐁')
    assert.equal(result.openGraph.url, 'https://pawpong.kr/home/user123')
  }
})

test('adoption photos and published notices are reflected; unpublished notices are hidden', async () => {
  const pet = await content(async () =>
    response({
      name: '콩이',
      description: '가족을 기다려요',
      primaryPhotoUrl: 'https://images.example.test/pet.jpg',
    }),
  ).getAdoptionMetadata('pet123')
  assert.equal(pet.openGraph.images[0].url, 'https://images.example.test/pet.jpg')
  assert.equal(pet.openGraph.url, 'https://pawpong.kr/adoption/pet123')
  for (const status of ['published', 'draft', 'archived']) {
    const notice = await content(async () =>
      response({ title: '공지', content: '<b>새 소식</b>', status }),
    ).getNoticeMetadata('notice123')
    assert.equal(notice.robots?.index === false, status !== 'published')
    if (status === 'published') assert.equal(notice.description, '새 소식')
  }
})
