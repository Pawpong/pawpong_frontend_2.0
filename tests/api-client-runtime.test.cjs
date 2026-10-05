const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const ts = require('typescript')
const axios = require('axios')

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
  'installed Axios preserves API client refresh retry and multipart file bytes',
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
      if (req.url === '/deny' || req.headers.authorization !== 'Bearer refreshed-fixture') {
        res.writeHead(401)
        res.end(JSON.stringify({ message: '인증이 필요합니다.' }))
        return
      }
      res.end(JSON.stringify({ ok: true }))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      let refreshes = 0
      const { ApiError } = load('src/shared/api/unwrap.ts', {})
      const { apiClient } = load('src/shared/api/client.ts', {
        axios,
        './unwrap': { ApiError },
        './token': { getAccessToken: () => 'expired-fixture' },
        '@/shared/lib/authSessionLifecycle': {
          getAuthSessionGeneration: () => 1,
          isAuthSessionCurrent: () => true,
        },
        '@/shared/lib/authSessionRecovery': {
          refreshAuthSession: async () => {
            refreshes += 1
            return 'refreshed-fixture'
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
        ['Bearer expired-fixture', 'Bearer refreshed-fixture'],
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
  'a stalled POST reports a safe API endpoint and a retry message without resending',
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
      assert.equal(requests, 1, 'mutations must not be replayed after an ambiguous timeout')
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
