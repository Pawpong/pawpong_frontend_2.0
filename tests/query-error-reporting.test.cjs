const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const query = require('@tanstack/react-query')

function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => dependencies[name])
  return output
}

test('failed queries and mutations reach Sentry with safe request context and no replay', async () => {
  const { ApiError, isApiError } = load('src/shared/api/unwrap.ts', {})
  const captures = []
  const { QueryProvider } = load('src/shared/lib/QueryProvider.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    react: { useState: (init) => [init()], useEffect: () => {} },
    '@tanstack/react-query': query,
    '@tanstack/react-query-devtools': { ReactQueryDevtools: () => null },
    '@/shared/api': { ApiError, isApiError, STALE_TIME: { DEFAULT: 30000 } },
    '@sentry/nextjs': { captureException: (...args) => captures.push(args) },
  })
  const client = QueryProvider({ children: null }).props.client
  try {
    const error = new ApiError('네트워크 연결을 확인해 주세요.', undefined, undefined, undefined, {
      method: 'POST',
      endpoint: '/api/v2/adopter/favorite',
      transportCode: 'ERR_NETWORK',
    })
    let attempts = 0
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => {
        attempts++
        throw error
      },
    })
    await assert.rejects(mutation.execute(), (actual) => actual === error)
    assert.equal(attempts, 1)
    assert.deepEqual(captures, [
      [error, { contexts: { api_request: { ...error.request, httpStatus: undefined } } }],
    ])

    const unavailable = new ApiError('시설 목록을 불러오지 못했어요.', 503, undefined, undefined, {
      method: 'GET',
      endpoint: '/api/v2/care-map/places',
    })
    await assert.rejects(
      client.fetchQuery({
        queryKey: ['unavailable'],
        queryFn: async () => {
          throw unavailable
        },
        retry: false,
      }),
      (actual) => actual === unavailable,
    )
    assert.equal(captures.length, 2)
    assert.equal(captures[1][1].contexts.api_request.httpStatus, 503)

    const invalidInput = new ApiError('입력값을 확인해 주세요.', 400)
    await assert.rejects(
      client
        .getMutationCache()
        .build(client, {
          mutationFn: async () => {
            throw invalidInput
          },
        })
        .execute(),
      (actual) => actual === invalidInput,
    )
    assert.equal(captures.length, 2, 'expected validation errors are not operational incidents')
  } finally {
    client.clear()
  }
})
