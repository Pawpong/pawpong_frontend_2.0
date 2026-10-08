const fs = require('node:fs')
const ts = require('typescript')
const { authCookieFixture } = require('../../fixtures/auth-cookie.fixture.cjs')

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
  let notifications = 0
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
  const boundary = authCookieFixture(
    { getAccessToken: () => cookie.get('accessToken') || null },
    lifecycle,
  )
  const fetch = async (url, options) => {
    calls.push(url)
    if (url.endsWith('set-cookie')) {
      cookie.set('accessToken', JSON.parse(options.body).accessToken)
      return Response.json({ ok: true })
    }
    return handler(url, options)
  }
  const recovery = load(
    'src/shared/lib/authSessionRecovery.ts',
    {
      '@/shared/api/token': { getAccessToken: () => cookie.get('accessToken') || null },
      '@/shared/api/unwrap': { ApiError },
      './authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts', {}),
      './authStateEvents': { notifyAuthStateChanged: () => notifications++ },
      './authSessionLifecycle': lifecycle,
      './authCookieLock': boundary.lock,
      './authCookieScope': boundary.scope,
      './authFetch': load('src/shared/lib/authFetch.ts', {}, { fetch, ...timers }),
    },
    {
      document,
      window: { location: { hostname: 'dev.pawpong.kr' } },
    },
  )
  return { ...recovery, ...lifecycle, calls, cookie, storage, notifications: () => notifications }
}

function token(owner, revision = 1, role = 'adopter') {
  return `test.${Buffer.from(JSON.stringify({ sub: owner, role, revision })).toString('base64url')}.test`
}

function refreshed(accessToken) {
  return Response.json({ success: true, data: { accessToken, refreshToken: 'synthetic-refresh' } })
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

module.exports = { setup, token, refreshed, deferred }
