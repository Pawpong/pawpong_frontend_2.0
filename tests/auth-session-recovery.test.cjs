const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies, globals = {}) {
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

function setup(handler, storage = new Map(), timers = {}) {
  const calls = []
  const cookie = new Map()
  const document = {
    set cookie(value) {
      const [name, token] = value.split(';')[0].split('=')
      if (value.includes('max-age=0')) cookie.delete(name)
      else cookie.set(name, token)
    },
  }
  const localStorage = {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  const lifecycle = load('src/shared/lib/authSessionLifecycle.ts', {}, { localStorage })
  const { ApiError } = load('src/shared/api/unwrap.ts', {})
  const recovery = load(
    'src/shared/lib/authSessionRecovery.ts',
    {
      '@/shared/api/token': { getAccessToken: () => cookie.get('accessToken') || null },
      '@/shared/api/unwrap': { ApiError },
      './authStateEvents': { notifyAuthStateChanged: () => {} },
      './authSessionLifecycle': lifecycle,
    },
    {
      document,
      window: { location: { hostname: 'dev.pawpong.kr' } },
      fetch: async (url, options) => {
        calls.push(url)
        if (url.endsWith('set-cookie')) {
          cookie.set('accessToken', JSON.parse(options.body).accessToken)
          return Response.json({ ok: true })
        }
        return handler(url, options)
      },
      ...timers,
    },
  )
  return { ...recovery, ...lifecycle, calls, cookie, storage }
}

test('expired access cookie restores the HttpOnly session once for concurrent callers', async () => {
  const app = setup(() =>
    Response.json({ success: true, data: { accessToken: 'next', refreshToken: 'next-refresh' } }),
  )
  assert.deepEqual(await Promise.all([app.restoreAuthSession(), app.refreshAuthSession()]), [
    'next',
    'next',
  ])
  assert.deepEqual(app.calls, ['/api/auth/refresh', '/api/auth/set-cookie'])
  assert.equal(await app.restoreAuthSession(), 'next')
  assert.equal(app.calls.length, 2)
})

test('network and server failures keep the existing session and allow a later retry', async () => {
  for (const response of [
    () => {
      throw new Error('offline')
    },
    () => new Response('', { status: 503 }),
  ]) {
    const app = setup(response)
    app.cookie.set('accessToken', 'existing')
    await assert.rejects(app.refreshAuthSession(), { status: 503 })
    assert.equal(app.cookie.get('accessToken'), 'existing')
    assert.deepEqual(app.calls, ['/api/auth/refresh'])
  }
})

test('refresh timeout remains active while the response body is stalled', async () => {
  let timeout
  let cleared = false
  const app = setup(
    (_url, { signal }) => ({
      ok: true,
      status: 200,
      json: () =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('body stalled')), { once: true })
        }),
    }),
    new Map(),
    {
      setTimeout: (callback) => {
        timeout = callback
        return 1
      },
      clearTimeout: () => {
        cleared = true
      },
    },
  )
  const result = app.restoreAuthSession()
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(cleared, false)
  timeout()
  await assert.rejects(result, { status: 503 })
  assert.equal(cleared, true)
})

test('confirmed invalid refresh clears cookies and anonymous resumes do not loop', async () => {
  const app = setup((url) => new Response('', { status: url.endsWith('refresh') ? 401 : 200 }))
  assert.equal(await app.restoreAuthSession(), null)
  assert.equal(await app.restoreAuthSession(), null)
  assert.deepEqual(app.calls, ['/api/auth/refresh', '/api/auth/clear-cookie'])
})

test('logout invalidates an in-flight refresh before cookies can be written', async () => {
  let resolve
  const app = setup(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const pending = app.refreshAuthSession()
  app.beginLogout()
  resolve(
    Response.json({ success: true, data: { accessToken: 'late', refreshToken: 'late-refresh' } }),
  )
  await assert.rejects(pending, { status: 401 })
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

test('offline logout survives a document reload until explicit login or cookie deletion', async () => {
  const app = setup(() => {
    throw new Error('offline')
  })
  app.cookie.set('accessToken', 'old')
  app.beginLogout()
  await app.clearAuthCookies()
  assert.equal(app.cookie.has('accessToken'), false)
  const reopened = setup(() => {
    throw new Error('must not refresh')
  }, app.storage)
  assert.equal(await reopened.restoreAuthSession(), null)
  assert.equal(reopened.calls.length, 0)
  assert.equal(reopened.hasPendingLogout(), true)
  reopened.beginLogin()
  assert.equal(reopened.hasPendingLogout(), false)
})
