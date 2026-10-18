const fs = require('node:fs')

const ts = require('typescript')

const { NextRequest } = require('next/server')

const { authCookieFixture } = require('../../fixtures/auth-cookie.fixture.cjs')

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

const policy = load('src/shared/lib/accountDeletion.ts')

const cookiePolicy = load('src/shared/lib/server/authCookies.ts')

const status = {
  requestId: '8489a5c2-1e57-420e-bb76-2ec48b2c5769',
  status: 'pending',
  requestedAt: '2026-09-24T00:00:00.000Z',
  appleConnectionRemovalRequired: true,
}

const receiptToken = 's'.repeat(43)

const accepted = { success: true, data: { ...status, receiptToken } }

const body = { confirmation: 'DELETE_PERMANENTLY' }

const authCookie = 'accessToken=current-user-token; refreshToken=never-forward-me'

const receiptCookie = `pawpongDeletionReceipt=${encodeURIComponent(JSON.stringify({ requestId: status.requestId, receiptToken }))}`

function setup(upstream = async () => Response.json(accepted)) {
  const calls = []
  const globals = {
    process: {
      env: { NODE_ENV: 'production', NEXT_PUBLIC_API_BASE_URL: 'https://api.pawpong.kr/' },
    },
    fetch: async (...args) => {
      calls.push(args)
      return upstream(...args)
    },
  }
  const server = load(
    'src/app/api/account-deletion/_lib/server.ts',
    {
      '@/shared/lib/accountDeletion': policy,
      '@/shared/lib/server/sameOrigin': load('src/shared/lib/server/sameOrigin.ts'),
    },
    globals,
  )
  const dependencies = {
    '@/shared/lib/accountDeletion': policy,
    '@/shared/lib/server/authCookies': cookiePolicy,
    './_lib/server': server,
    '../_lib/server': server,
  }
  const requestRoute = load('src/app/api/account-deletion/route.ts', dependencies)
  const statusRoute = load('src/app/api/account-deletion/status/route.ts', dependencies)
  const prepareRoute = load('src/app/api/account-deletion/prepare/route.ts', dependencies)
  function request(value = body, headers = {}, path = '', method = 'POST') {
    return new NextRequest(`https://pawpong.kr/api/account-deletion${path}`, {
      method,
      headers: {
        origin: 'https://pawpong.kr',
        host: 'pawpong.kr',
        'content-type': 'application/json',
        cookie: `${authCookie}; ${receiptCookie}`,
        ...headers,
      },
      body: method === 'POST' ? JSON.stringify(value) : undefined,
    })
  }
  return {
    calls,
    request,
    POST: requestRoute.POST,
    status: statusRoute.POST,
    close: statusRoute.DELETE,
    prepare: prepareRoute.POST,
  }
}

function setupClient(
  upstream = async () => Response.json({ success: true, data: status }),
  prepare = async () => Response.json({ success: true, prepared: true }),
) {
  const events = []
  const lifecycle = {
    beginLogout: () => events.push('logout-intent'),
    beginLogin: () => events.push('restore-session'),
    waitForAuthCookieWrites: async () => events.push('wait-cookie-writes'),
    getAuthSessionGeneration: () => 0,
  }
  const boundary = authCookieFixture({ getAccessToken: () => 'synthetic-session' }, lifecycle)
  const client = load(
    'src/features/account-deletion/api/accountDeletion.ts',
    {
      '@/shared/lib/accountDeletion': policy,
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/authCookieLock': boundary.lock,
      '@/shared/lib/authCookieScope': boundary.scope,
      '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => events.push('notify-auth') },
      '@/shared/lib/authSessionRecovery': {
        clearAuthCookies: async () => {
          events.push('/api/auth/clear-cookie')
          await upstream('/api/auth/clear-cookie').catch(() => {})
        },
      },
      '@/shared/lib/nativePushSession': {
        unregisterNativePushSession: async () => events.push('native-unregister'),
      },
    },
    {
      fetch: async (url, options) => {
        events.push(url)
        if (url.endsWith('/prepare')) return prepare()
        return upstream(url, options)
      },
    },
  )
  return { ...client, events }
}

module.exports = { load, policy, cookiePolicy, status, receiptToken, accepted, body, authCookie, receiptCookie, setup, setupClient, NextRequest }
