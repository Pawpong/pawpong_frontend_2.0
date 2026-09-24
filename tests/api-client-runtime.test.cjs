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
  new Function('exports', 'require', code)(output, (name) => dependencies[name])
  return output
}

test('installed Axios preserves API client refresh retry and multipart file bytes', { timeout: 10000 }, async () => {
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
    assert.deepEqual(calls.map((call) => call.authorization), [
      'Bearer expired-fixture',
      'Bearer refreshed-fixture',
    ])

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
})
