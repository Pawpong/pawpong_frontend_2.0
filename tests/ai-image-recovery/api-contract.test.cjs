const {
  test,
  assert,
  auth,
  load,
  ApiError,
  job,
  input,
  requestAuthFixture,
} = require('./fixtures/core.fixture.cjs')
const { mount } = require('./fixtures/transform.fixture.cjs')

test('API는 취소 신호와 조회 제한 시간을 전달하고 쓰기를 자동 재실행하지 않음', async () => {
  const calls = []
  const apiClient = {
    post: async (...args) => {
      calls.push(['POST', ...args])
      return { data: { success: true, data: job() } }
    },
    get: async (...args) => {
      calls.push(['GET', ...args])
      return { data: { success: true, data: job() } }
    },
  }
  const { unwrap } = load('src/shared/api/unwrap.ts')
  const api = load('src/entities/ai-image/api/aiImage.api.ts', {
    '@/shared/api': { apiClient, API_VERSION: '/api/v2', unwrap },
  })
  const signal = new AbortController().signal
  await api.uploadAiImageSource(input.file, { signal })
  await api.requestAiImageGeneration({ filterId: 'fixture', inputObjectKey: 'source' }, { signal })
  await api.getAiImageGeneration('fixture-job', { signal, timeout: 123 })
  await api.getAiImageGeneration('fixture-job')
  await api.getAiImageGenerationImage('fixture-job', { signal, timeout: 234 })
  assert.equal(calls[0][3].signal, signal)
  assert.equal(calls[0][3].timeout, 60000)
  assert.equal(calls[1][3].signal, signal)
  assert.equal(calls[2][2].signal, signal)
  assert.equal(calls[2][2].timeout, 123)
  assert.equal(calls[3][2].timeout, 10000)
  assert.equal(calls[4][2].timeout, 234)
  assert.equal(calls[4][2].responseType, 'blob')
})

test('보관함은 대기 작업이 있을 때만 갱신하고 익명 조회를 허용하지 않음', () => {
  const { aiImageQueries } = load('src/entities/ai-image/api/aiImage.queries.ts', {
    '@tanstack/react-query': { queryOptions: (config) => config },
    '@/shared/api': { createQuery: (config) => config, STALE_TIME: { REALTIME: 0 } },
    './aiImage.api': {},
  })
  const config = aiImageQueries.myGenerations(false)
  assert.equal(config.enabled, false)
  for (const status of ['pending', 'queued', 'processing'])
    assert.equal(config.refetchInterval({ state: { data: [job(status)] } }), 5000)
  for (const data of [undefined, [], [job('succeeded')], [job('failed')]])
    assert.equal(config.refetchInterval({ state: { data } }), false)
})

test(
  '실제 Axios 클라이언트는 추가 생성 없이 시간 초과된 HTTP 상태 응답을 복구함',
  { timeout: 12000 },
  async () => {
    const http = require('node:http')
    const axios = require('axios')
    const calls = []
    let reads = 0
    const server = http.createServer(async (req, res) => {
      calls.push({ method: req.method, path: req.url })
      for await (const _ of req) {
        /* 응답 전에 업로드 바이트를 모두 읽는다. */
      }
      if (req.url.endsWith('/image')) {
        res.setHeader('Content-Type', 'image/png')
        res.end('actual-result-bytes')
        return
      }
      if (req.method === 'GET' && ++reads === 1) return
      res.setHeader('Content-Type', 'application/json')
      const data = req.url.endsWith('/source')
        ? { inputObjectKey: 'ai-image/source/fixture.png' }
        : job(req.method === 'POST' ? 'queued' : 'succeeded')
      res.end(JSON.stringify({ success: true, data }))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    let hook
    try {
      const { apiClient } = load('src/shared/api/client.ts', {
        axios,
        './unwrap': { ApiError },
        './token': { getAccessToken: () => auth.state.token },
        './requestAuthScope': requestAuthFixture(
          { getAccessToken: () => auth.state.token },
          { getAuthSessionGeneration: () => 1 },
        ),
        '@/shared/lib/authSessionLifecycle': {
          getAuthSessionGeneration: () => 1,
          isAuthSessionCurrent: () => true,
        },
        '@/shared/lib/authSessionRecovery': {
          refreshAuthSession: async () => {
            throw new Error('unexpected refresh')
          },
        },
        '@/shared/config/apiBaseUrl': {
          getApiBaseUrl: () => `http://127.0.0.1:${server.address().port}`,
        },
      })
      apiClient.defaults.proxy = false
      // 시험 요청의 시간만 단축한다. 실제 조회 제한은 별도 계약 검증을 유지한다.
      apiClient.interceptors.request.use((config) => {
        if (config.method === 'get') config.timeout = 50
        return config
      })
      const { unwrap } = load('src/shared/api/unwrap.ts')
      const api = load('src/entities/ai-image/api/aiImage.api.ts', {
        '@/shared/api': { apiClient, API_VERSION: '/api/v2', unwrap },
      })
      hook = mount({
        upload: api.uploadAiImageSource,
        request: api.requestAiImageGeneration,
        status: api.getAiImageGeneration,
        image: api.getAiImageGenerationImage,
      })
      const result = await hook.render().transform(input)
      assert.equal(hook.render().phase, 'done')
      assert.equal(await result.file.text(), 'actual-result-bytes')
      assert.equal(
        calls.filter((call) => call.method === 'POST' && call.path.endsWith('/generation')).length,
        1,
      )
      assert.equal(reads, 2)
    } finally {
      hook?.unmount()
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  },
)
