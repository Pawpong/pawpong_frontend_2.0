const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setImmediate: tick } = require('node:timers/promises')
const query = require('@tanstack/react-query')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')
const api = load('src/shared/api/unwrap.ts')
const recovery = load('src/shared/api/queryRecovery.ts', { './unwrap': api })

function fixture() {
  const effects = []
  const window = new EventTarget()
  const document = new EventTarget()
  let identityChecks = 0
  const { QueryProvider } = load(
    'src/shared/lib/QueryProvider.tsx',
    {
      react: { useState: (init) => [init()], useEffect: (effect) => effects.push(effect) },
      '@tanstack/react-query': query,
      '@tanstack/react-query-devtools': { ReactQueryDevtools: () => null },
      '@/shared/api': { ...api, STALE_TIME: { DEFAULT: 300_000 } },
      '@sentry/nextjs': { captureException: () => {} },
      './authStateEvents': { AUTH_STATE_CHANGED: 'auth-changed' },
      './authQueryBoundary': { createAuthQueryBoundary: () => () => identityChecks++ },
      '../api/queryRecovery': recovery,
    },
    { window, document, performance: { getEntriesByType: () => [] } },
  )
  const client = QueryProvider({ children: null }).props.client
  client.mount()
  const cleanups = effects.map((effect) => effect())
  return {
    client,
    window,
    identityChecks: () => identityChecks,
    close: () => {
      cleanups.forEach((cleanup) => cleanup?.())
      client.unmount()
      client.clear()
    },
  }
}

const failure = (status, code) =>
  new api.ApiError('temporary', status, undefined, undefined, {
    method: 'GET',
    endpoint: '/api/v2/home/banners',
    transportCode: code,
  })

test('focus restores an active failed GET with fresh cached data without refetching healthy caches', async () => {
  const f = fixture()
  const subscriptions = []
  try {
    let calls = 0
    f.client.setQueryData(['failed'], 'previous data')
    const options = {
      queryKey: ['failed'],
      retry: false,
      queryFn: async () => {
        calls++
        if (calls === 1) throw failure(undefined, 'ERR_NETWORK')
        return 'recovered data'
      },
    }
    const observer = new query.QueryObserver(f.client, options)
    subscriptions.push(observer.subscribe(() => {}))
    await observer.refetch()
    assert.equal(f.client.getQueryState(['failed']).status, 'error')

    let healthyCalls = 0
    f.client.setQueryData(['healthy'], 'cached')
    const healthy = new query.QueryObserver(f.client, {
      queryKey: ['healthy'],
      queryFn: async () => ++healthyCalls,
    })
    subscriptions.push(healthy.subscribe(() => {}))

    query.focusManager.setFocused(false)
    query.focusManager.setFocused(true)
    await tick()
    await tick()
    assert.equal(f.client.getQueryData(['failed']), 'recovered data')
    assert.equal(calls, 2)
    assert.equal(healthyCalls, 0)
  } finally {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    f.close()
    query.focusManager.setFocused(undefined)
  }
})

test('native app resume retries only active transient reads and never a failed mutation', async () => {
  const f = fixture()
  const subscriptions = []
  const calls = new Map()
  try {
    for (const [key, error, active] of [
      ['network', failure(undefined, 'ERR_NETWORK'), true],
      ['server', failure(503), true],
      ['unauthorized', failure(401), true],
      ['cancelled', failure(undefined, 'ERR_CANCELED'), true],
      ['inactive', failure(503), false],
    ]) {
      calls.set(key, 0)
      const options = {
        queryKey: [key],
        retry: false,
        queryFn: async () => {
          const count = calls.get(key) + 1
          calls.set(key, count)
          if (count === 1) throw error
          return 'recovered'
        },
      }
      if (active) {
        const observer = new query.QueryObserver(f.client, options)
        subscriptions.push(observer.subscribe(() => {}))
        await observer.refetch()
      } else {
        await assert.rejects(f.client.fetchQuery(options))
      }
    }
    let writes = 0
    await assert.rejects(
      f.client
        .getMutationCache()
        .build(f.client, {
          mutationFn: async () => {
            writes++
            throw failure(undefined, 'ETIMEDOUT')
          },
        })
        .execute(),
    )

    f.window.dispatchEvent(new Event('pawpong:app-active'))
    await tick()
    await tick()
    assert.equal(f.identityChecks(), 1)
    assert.deepEqual(Object.fromEntries(calls), {
      network: 2,
      server: 2,
      unauthorized: 1,
      cancelled: 1,
      inactive: 1,
    })
    assert.equal(writes, 1)
    const interval = f.client.getDefaultOptions().queries.refetchInterval
    assert.equal(interval({ state: { status: 'error', error: failure(503) } }), 30_000)
    for (const error of [
      failure(400),
      failure(401),
      failure(undefined, 'ERR_CANCELED'),
      new Error('render bug'),
    ]) {
      assert.equal(interval({ state: { status: 'error', error } }), false)
    }
  } finally {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    f.close()
  }
})
