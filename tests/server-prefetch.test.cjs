const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { AsyncLocalStorage } = require('node:async_hooks')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

// Next 처럼 요청 하나를 흉내 낸다 — React cache 와 cookies() 는 요청마다 따로다
const request = new AsyncLocalStorage()
const asRequest = (token, fn) => request.run({ token, memo: new Map() }, fn)
const react = {
  cache: (fn) => () => {
    const { memo } = request.getStore()
    if (!memo.has(fn)) memo.set(fn, fn())
    return memo.get(fn)
  },
}
const headers = {
  cookies: async () => ({
    get: (name) => {
      const { token } = request.getStore()
      return name === 'accessToken' && token ? { value: token } : undefined
    },
  }),
}

const token = load('src/shared/api/token.ts')
const { fetchForRequest, dehydrateForRequest } = load('src/app/_lib/requestQueries.ts', {
  'server-only': {},
  react,
  'next/headers': headers,
  '@/shared/api': {
    setServerTokenReader: token.setServerTokenReader,
    isApiError: (error) => error?.name === 'ApiError',
  },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
// apiClient 가 던지는 ApiError 처럼 상태 코드를 가진 오류
const apiError = (status) => Object.assign(new Error(String(status)), { name: 'ApiError', status })
const dataOf = (state, key) => state.queries.find((query) => query.queryKey[0] === key)?.state.data

test('메타데이터와 화면이 한 번의 조회를 같이 쓰고, 동시에 들어온 요청끼리 토큰이 섞이지 않음', async () => {
  const calls = []
  // API 함수처럼 요청 도중 getAccessToken 으로 토큰을 읽는 쿼리
  const whoAmI = (delay) => ({
    queryKey: ['who-am-i'],
    queryFn: async () => {
      calls.push(token.getAccessToken())
      await sleep(delay)
      return token.getAccessToken()
    },
  })
  const visit = (who, delay) =>
    asRequest(who, async () => {
      const [meta, state] = await Promise.all([
        fetchForRequest(whoAmI(delay)),
        dehydrateForRequest([whoAmI(delay)]),
      ])
      return { meta, page: dataOf(state, 'who-am-i') }
    })
  // 먼저 시작한 요청이 늦게 끝나도록 엇갈리게 둔다
  const [a, b, anonymous] = await Promise.all([
    visit('token-a', 30),
    visit('token-b', 5),
    visit(null, 15),
  ])
  assert.deepEqual(a, { meta: 'token-a', page: 'token-a' })
  assert.deepEqual(b, { meta: 'token-b', page: 'token-b' })
  assert.deepEqual(anonymous, { meta: null, page: null })
  assert.equal(calls.length, 3)
  // 요청 밖에서는 아무 토큰도 보이지 않는다
  assert.equal(token.getAccessToken(), null)
})

test('실패한 조회는 다시 부르지 않고 넘기지도 않아 브라우저가 평소대로 받음', async () => {
  let calls = 0
  const broken = {
    queryKey: ['broken'],
    queryFn: async () => {
      calls += 1
      throw new Error('400')
    },
  }
  const state = await asRequest(null, async () => {
    assert.equal(await fetchForRequest(broken), null)
    return dehydrateForRequest([broken])
  })
  assert.equal(calls, 1)
  assert.deepEqual(state.queries, [])
})

test('만료된 토큰으로 거절되면 익명으로 한 번 더 받아 공개 화면·메타데이터를 살림', async () => {
  const calls = []
  const post = {
    queryKey: ['post'],
    queryFn: async () => {
      const who = token.getAccessToken()
      calls.push(who)
      if (who === 'expired') throw apiError(401)
      return `seen-as-${who}`
    },
  }
  const result = await asRequest('expired', async () => {
    const [meta, state] = await Promise.all([fetchForRequest(post), dehydrateForRequest([post])])
    return { meta, page: dataOf(state, 'post') }
  })
  assert.deepEqual(result, { meta: 'seen-as-null', page: 'seen-as-null' })
  // 토큰 한 번 + 익명 한 번. 메타데이터와 화면이 같이 써서 더 부르지 않는다
  assert.deepEqual(calls, ['expired', null])
})

test('입양자로 먼저 찾고 아니면 브리더 — 찾은 쪽만 화면으로 넘어가고 조회는 한 번씩', async () => {
  const calls = []
  const profile = (kind, ok) => ({
    queryKey: [kind],
    queryFn: async () => {
      calls.push(kind)
      if (!ok) throw apiError(400)
      return kind
    },
  })
  const find = () =>
    fetchForRequest(profile('adopter', false)).then(
      (found) => found ?? fetchForRequest(profile('breeder', true)),
    )
  const state = await asRequest(null, async () => {
    const [meta] = await Promise.all([find(), find()]) // 메타데이터와 페이지가 같이 찾는다
    assert.equal(meta, 'breeder')
    return dehydrateForRequest()
  })
  assert.deepEqual(
    state.queries.map((query) => query.queryKey[0]),
    ['breeder'],
  )
  assert.deepEqual(calls, ['adopter', 'breeder'])
})

test('로그인 전용 쿼리는 로그인 요청에서만 부름', async () => {
  const calls = []
  const me = { queryKey: ['me'], queryFn: async () => calls.push(token.getAccessToken()) }
  await asRequest(null, () => dehydrateForRequest([], [me]))
  await asRequest('token-a', () => dehydrateForRequest([], [me]))
  assert.deepEqual(calls, ['token-a'])

  // 토큰이 거절돼도 익명으로 다시 부르지 않는다 — 로그인해야만 받는 값이다
  const rejected = []
  const expiredMe = {
    queryKey: ['me'],
    queryFn: async () => {
      rejected.push(token.getAccessToken())
      throw apiError(401)
    },
  }
  await asRequest('expired', () => dehydrateForRequest([], [expiredMe]))
  assert.deepEqual(rejected, ['expired'])
})

test('ServerPrefetch 를 쓰는 페이지는 캐시하지 않음 — 개인 값이 다른 사람 HTML 로 가지 않게', () => {
  const pages = fs
    .readdirSync('src/app', { recursive: true })
    .map((file) => path.join('src/app', file))
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => fs.readFileSync(file, 'utf8').includes('<ServerPrefetch'))
  assert.ok(pages.length >= 3)
  for (const file of pages) {
    assert.doesNotMatch(
      fs.readFileSync(file, 'utf8'),
      /export const (revalidate|dynamic\s*=\s*['"]force-static)|['"]use cache['"]|generateStaticParams/,
      file,
    )
  }
})
