const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { NextRequest } = require('next/server')

const jwt = (payload) =>
  `fixture.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.fixture`
const tokens = {
  accessToken: jwt({ role: 'adopter', exp: 2147483647 }),
  refreshToken: 'synthetic-refresh',
}
const refreshed = {
  success: true,
  code: 200,
  message: '토큰이 갱신되었습니다.',
  timestamp: '2026-10-08T00:00:00.000Z',
  data: { ...tokens, accessTokenExpiresIn: 3600, refreshTokenExpiresIn: 604800 },
}

function setup(
  action,
  {
    upstream = async () => Response.json(refreshed),
    refreshToken = 'synthetic-refresh',
    env = 'development',
  } = {},
) {
  const calls = [],
    logged = [],
    cache = new Map()
  let cookieReads = 0
  const globals = {
    process: { env: { NODE_ENV: env, NEXT_PUBLIC_API_BASE_URL: 'https://synthetic.invalid/' } },
    fetch: async (...args) => {
      calls.push(args)
      return upstream(...args)
    },
    console: { error: (...args) => logged.push(args) },
  }
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const output = {}
    cache.set(file, output)
    const requireSource = (name) => {
      if (name === 'next/headers')
        return {
          cookies: async () => {
            cookieReads++
            return { get: () => (refreshToken ? { value: refreshToken } : undefined) }
          },
        }
      if (!name.startsWith('@/') && !name.startsWith('.')) return require(name)
      const base = name.startsWith('@/')
        ? 'src/' + name.slice(2)
        : path.join(path.dirname(file), name)
      return load(fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'))
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
  const route = load(`src/app/api/auth/${action}/route.ts`)
  function request(body = tokens, headers = {}, host = 'dev.pawpong.kr') {
    return new NextRequest(`https://${host}/api/auth/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: `https://${host}`, host, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  }
  return { ...route, request, calls, logged, cookieReads: () => cookieReads, load }
}

module.exports = { setup, jwt, tokens, refreshed, NextRequest }
