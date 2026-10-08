const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const ts = require('typescript')
const axios = require('axios')
const { requestAuthFixture } = require('./fixtures/request-auth.fixture.cjs')
const { token } = require('./api-session-boundary/fixtures/api.fixture.cjs')

function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) =>
    name === '@/shared/config/apiDiagnosticRoutes'
      ? load('src/shared/config/apiDiagnosticRoutes.ts', {})
      : dependencies[name],
  )
  return output
}

test(
  '설치된 Axios는 인증 갱신 재시도와 멀티파트 파일 바이트를 유지함',
  { timeout: 10000 },
  async () => {
    const calls = []
    const server = http.createServer(async (req, res) => {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = Buffer.concat(chunks).toString('utf8')
      calls.push({ path: req.url, authorization: req.headers.authorization })
      res.setHeader('Content-Type', 'application/json')
      if (req.url === '/upload') {
        res.end(JSON.stringify({ contentType: req.headers['content-type'], body }))
        return
      }
      if (req.url === '/deny' || req.headers.authorization !== `Bearer ${token('owner-a', 2)}`) {
        res.writeHead(401)
        res.end(JSON.stringify({ message: '인증이 필요합니다.' }))
        return
      }
      res.end(JSON.stringify({ ok: true }))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      let refreshes = 0
      let currentToken = token('owner-a')
      const tokens = { getAccessToken: () => currentToken }
      const { ApiError } = load('src/shared/api/unwrap.ts', {})
      const { apiClient } = load('src/shared/api/client.ts', {
        axios,
        './unwrap': { ApiError },
        './token': tokens,
        './requestAuthScope': requestAuthFixture(tokens, { getAuthSessionGeneration: () => 1 }),
        '@/shared/lib/authSessionLifecycle': {
          getAuthSessionGeneration: () => 1,
          isAuthSessionCurrent: () => true,
        },
        '@/shared/lib/authSessionRecovery': {
          refreshAuthSession: async () => {
            refreshes += 1
            currentToken = token('owner-a', 2)
            return currentToken
          },
        },
        '@/shared/config/apiBaseUrl': {
          getApiBaseUrl: () => `http://127.0.0.1:${server.address().port}`,
        },
      })
      apiClient.defaults.proxy = false
      apiClient.defaults.timeout = 2000
      assert.deepEqual((await apiClient.get('/protected')).data, { ok: true })
      assert.equal(refreshes, 1)
      assert.deepEqual(
        calls.map((call) => call.authorization),
        [`Bearer ${token('owner-a')}`, `Bearer ${token('owner-a', 2)}`],
      )

      await assert.rejects(apiClient.get('/deny', { skipAuthRefresh: true }), { status: 401 })
      assert.equal(refreshes, 1)

      const form = new FormData()
      form.append('file', new Blob(['fixture-file-bytes'], { type: 'image/png' }), 'photo.png')
      const upload = (await apiClient.post('/upload', form)).data
      assert.match(upload.contentType, /^multipart\/form-data; boundary=/)
      assert.match(upload.body, /filename="photo\.png"/)
      assert.match(upload.body, /fixture-file-bytes/)
      assert.doesNotMatch(upload.body, /"file":\{\}/)
    } finally {
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  },
)

test(
  '응답 없는 쓰기는 개인정보 없는 경로와 재시도 안내를 제공하고 자동 전송하지 않음',
  { timeout: 10000 },
  async () => {
    let requests = 0
    const server = http.createServer(() => {
      requests++
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const { ApiError } = load('src/shared/api/unwrap.ts', {})
      const { apiClient } = load('src/shared/api/client.ts', {
        axios,
        './unwrap': { ApiError },
        './token': { getAccessToken: () => 'private-token-fixture' },
        './requestAuthScope': requestAuthFixture(
          { getAccessToken: () => 'private-token-fixture' },
          { getAuthSessionGeneration: () => 1 },
        ),
        '@/shared/lib/authSessionLifecycle': {},
        '@/shared/lib/authSessionRecovery': {},
        '@/shared/config/apiBaseUrl': {
          getApiBaseUrl: () => `http://127.0.0.1:${server.address().port}`,
        },
      })
      apiClient.defaults.proxy = false
      await assert.rejects(
        apiClient.post(
          '/api/v2/auth/upload-breeder-profile?tempId=private-session-fixture',
          { privateBody: 'private-user-input-fixture' },
          { timeout: 80 },
        ),
        (error) => {
          assert.ok(error instanceof ApiError)
          assert.match(error.message, /잠시 후 다시 시도/)
          assert.deepEqual(error.request, {
            method: 'POST',
            endpoint: '/api/v2/auth/upload-breeder-profile',
            transportCode: 'ECONNABORTED',
          })
          assert.doesNotMatch(JSON.stringify(error), /private-/)
          return true
        },
      )
      assert.equal(requests, 1, '시간 초과로 결과를 알 수 없는 쓰기를 자동 재실행하지 않는다')
      await assert.rejects(
        apiClient.get('/api/v2/adoption/69b145b8bb7113dab153250f?secret=private-query-fixture', {
          adapter: (config) =>
            Promise.reject(new axios.AxiosError('Network Error', 'ERR_NETWORK', config)),
        }),
        (error) => {
          assert.match(error.message, /네트워크 연결/)
          assert.equal(error.request.endpoint, '/api/v2/adoption/:id')
          assert.equal(error.request.transportCode, 'ERR_NETWORK')
          assert.doesNotMatch(JSON.stringify(error), /69b145b8|private-/)
          return true
        },
      )
      await assert.rejects(
        apiClient.get('/api/v2/adoption/ffffffffffffffffffffffff', {
          adapter: (config) =>
            Promise.reject(new axios.AxiosError('Network Error', 'ERR_NETWORK', config)),
        }),
        (error) => {
          assert.equal(error.request.endpoint, '/api/v2/adoption/:id')
          return true
        },
      )
      for (const [path, endpoint] of [
        ['/api/v2/profile/users/private-user', '/api/v2/profile/users/:id'],
        ['/api/v2/profile/users/adoption/follow', '/api/v2/profile/users/:id/follow'],
        ['/api/v2/care-map/directory?query=private-user', '/api/v2/care-map/directory'],
        ['/api/v2/playground/pet/me', '/api/v2/playground/pet/me'],
        ['/api/v2/playground/pet/eligible-images', '/api/v2/playground/pet/eligible-images'],
        ['/api/v2/playground/pet/games/memory/flip', '/api/v2/playground/pet/games/memory/flip'],
        ['/api/v2/chat/blocks/private-user', '/api/v2/chat/blocks/:id'],
        ['/api/v2/private-user/unknown', '/unknown'],
      ]) {
        await assert.rejects(
          apiClient.get(path, {
            adapter: (config) =>
              Promise.reject(new axios.AxiosError('Network Error', 'ERR_NETWORK', config)),
          }),
          (error) => {
            assert.equal(error.request.endpoint, endpoint)
            assert.doesNotMatch(JSON.stringify(error), /private-user/)
            return true
          },
        )
      }
    } finally {
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  },
)
