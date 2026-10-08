const fs = require('node:fs')
const ts = require('typescript')
const { NextRequest } = require('next/server')

function load(file, overrides = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', ...Object.keys(globals), source)(
    output,
    (name) => overrides[name] ?? require(name),
    ...Object.values(globals),
  )
  return output
}
const policy = load('src/shared/lib/reviewLogin.ts')
const credentials = { emailAddress: 'review@example.com', password: 'test password' }
const session = {
  success: true,
  data: {
    accessToken: 'access-from-backend',
    refreshToken: 'refresh-from-backend',
    expiresIn: 3600,
    user: {
      userId: 'review-user',
      email: credentials.emailAddress,
      role: 'adopter',
      nickname: '심사',
    },
  },
}
function setupRoute(upstream = async () => Response.json(session)) {
  const calls = []
  const route = load(
    'src/app/api/auth/review-login/route.ts',
    {
      '@/shared/lib/reviewLogin': policy,
      '@/shared/lib/server': {
        ...load('src/shared/lib/server/sameOrigin.ts'),
        ...load('src/shared/lib/server/readBoundedJson.ts'),
      },
    },
    {
      process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.pawpong.kr/' } },
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  const request = (body = credentials, headers = {}) =>
    new NextRequest('https://pawpong.kr/api/auth/review-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://pawpong.kr', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  return { ...route, calls, request }
}
function setupClient(upstream) {
  const storage = new Map()
  const lifecycle = load(
    'src/shared/lib/authSessionLifecycle.ts',
    {},
    {
      localStorage: {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    },
  )
  const saved = []
  const calls = []
  const client = load(
    'src/features/auth/api/review-login.ts',
    {
      '@/shared/lib/reviewLogin': policy,
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/saveAuthTokens': {
        saveAuthTokens: async (tokens) => {
          saved.push(tokens)
          return true
        },
      },
    },
    {
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  return { ...client, ...lifecycle, saved, calls }
}

module.exports = { load, policy, credentials, session, setupRoute, setupClient, NextRequest }
