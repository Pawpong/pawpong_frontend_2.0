const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const token = (sub, revision = 1) =>
  `fixture.${Buffer.from(JSON.stringify({ sub, role: 'adopter', revision })).toString('base64url')}.fixture`
const response = (accessToken) =>
  Response.json({ success: true, data: { accessToken, refreshToken: 'synthetic-refresh' } })
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
async function until(condition) {
  for (let i = 0; i < 100 && !condition(); i++)
    await new Promise((resolve) => setTimeout(resolve, 2))
  if (!condition()) throw new Error('합성 작업이 시작되지 않음')
}

function createBrowser({ locks = true, timers = {} } = {}) {
  const cookies = new Map([['accessToken', token('first')]])
  const storage = new Map()
  const requests = []
  let queue = Promise.resolve(),
    active = 0,
    maximum = 0
  const navigator = locks
    ? {
        locks: {
          request: (_name, callback) => {
            const pending = queue.then(async () => {
              maximum = Math.max(maximum, ++active)
              try {
                return await callback({})
              } finally {
                active--
              }
            })
            queue = pending.catch(() => {})
            return pending
          },
        },
      }
    : {}
  const status = {
    requestId: '8489a5c2-1e57-420e-bb76-2ec48b2c5769',
    status: 'pending',
    requestedAt: '2026-10-08T00:00:00.000Z',
    appleConnectionRemovalRequired: false,
  }

  function tab(handler = async () => undefined, native = async () => {}) {
    const modules = new Map()
    let notifications = 0
    const document = {
      get cookie() {
        return [...cookies].map(([key, value]) => `${key}=${value}`).join('; ')
      },
      set cookie(value) {
        const [key, content] = value.split(';')[0].split('=')
        if (value.includes('max-age=0')) cookies.delete(key)
        else cookies.set(key, content)
      },
    }
    const globals = {
      ...timers,
      navigator,
      document,
      window: { location: { hostname: 'localhost' }, dispatchEvent: () => notifications++ },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      fetch: async (url, options = {}) => {
        requests.push({ url, token: cookies.get('accessToken') })
        const result = await handler(url, options)
        if (url.endsWith('/set-cookie') && (!result || result.ok))
          cookies.set('accessToken', JSON.parse(options.body).accessToken)
        if (url.endsWith('/clear-cookie') && (!result || result.ok)) cookies.delete('accessToken')
        if (result) return result
        if (url.endsWith('/prepare')) return Response.json({ success: true, prepared: true })
        if (url === '/api/account-deletion') {
          cookies.delete('accessToken')
          return Response.json({ success: true, data: status })
        }
        if (url.endsWith('/status')) return new Response('', { status: 404 })
        return Response.json({ ok: true })
      },
    }
    function load(file) {
      if (modules.has(file)) return modules.get(file)
      const output = {}
      modules.set(file, output)
      const requireSource = (name) => {
        if (name === '@/shared/lib/nativePushSession')
          return { unregisterNativePushSession: native }
        if (name === '@/shared/api')
          return {
            ...load('src/shared/api/unwrap.ts'),
            API_VERSION: '/api/v2',
            apiClient: {
              post: async (url) => {
                const result = await globals.fetch(url)
                return {
                  data: {
                    success: result.ok,
                    data: { message: '합성 로그아웃', loggedOutAt: '2026-10-08' },
                  },
                }
              },
            },
          }
        if (!name.startsWith('@/') && !name.startsWith('.')) return require(name)
        const base = name.startsWith('@/')
          ? 'src/' + name.slice(2)
          : path.join(path.dirname(file), name)
        return load(base + (fs.existsSync(base + '.ts') ? '.ts' : '.tsx'))
      }
      const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      }).outputText
      new Function('exports', 'require', ...Object.keys(globals), source)(
        output,
        requireSource,
        ...Object.values(globals),
      )
      return output
    }
    return {
      load,
      ...load('src/shared/lib/authSessionLifecycle.ts'),
      ...load('src/shared/lib/saveAuthTokens.ts'),
      ...load('src/shared/lib/authSessionRecovery.ts'),
      ...load('src/features/auth/api/auth.api.ts'),
      ...load('src/features/account-deletion/api/accountDeletion.ts'),
      notifications: () => notifications,
    }
  }
  return { tab, cookies, storage, requests, status, maxActive: () => maximum }
}

module.exports = { createBrowser, token, response, deferred, until }
