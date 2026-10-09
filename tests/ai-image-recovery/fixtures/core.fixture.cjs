const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { notificationFixture } = require('../../notifications/fixtures/notification.fixture.cjs')
const { requestAuthFixture } = require('../../fixtures/request-auth.fixture.cjs')
const auth = notificationFixture()
function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => {
    if (name === '@/shared/lib/authReadSession') return auth.session
    // 화면에 보이는지 추적하는 훅은 서버 렌더에서 항상 보이는 것으로 둔다.
    if (name === '@/shared/lib/useViewportPosition')
      return { useViewportPosition: () => [() => {}, 'inside'] }
    if (name === '@/shared/lib/useAuthReadSession')
      return { useAuthReadSession: auth.session.getAuthReadSession }
    if (name === '@/shared/api/token') return { getAccessToken: () => auth.state.token }
    if (name === '@/shared/api/unwrap') return dependencies[name] ?? { ApiError: auth.ApiError }
    if (name === '@/shared/api')
      return {
        withAuthReadSession: auth.withAuthReadSession,
        withAuthWriteSession: auth.withAuthWriteSession,
        AuthWriteRetryRequiredError: auth.AuthWriteRetryRequiredError,
        getAuthReadSession: auth.session.getAuthReadSession,
        getAccessToken: () => auth.state.token,
        ApiError: dependencies['@/shared/api/unwrap']?.ApiError ?? auth.ApiError,
        ...dependencies[name],
      }
    if (name === '@/shared/config/apiDiagnosticRoutes') {
      return load('src/shared/config/apiDiagnosticRoutes.ts')
    }
    if (!(name in dependencies)) throw new Error(`Missing test dependency: ${name}`)
    return dependencies[name]
  })
  return output
}
const { ApiError } = load('src/shared/api/unwrap.ts')
const recovery = load('src/features/ai-image/lib/aiImageRecovery.ts', {
  '@/shared/api/unwrap': { ApiError },
})
const job = (status = 'queued', jobId = 'fixture-job') => ({
  jobId,
  status,
  filterId: 'fixture-filter',
  resultImageUrl: status === 'succeeded' ? 'https://example.test/result.png' : undefined,
  resultObjectKey: status === 'succeeded' ? 'ai-image/result/fixture.png' : null,
  errorCode: null,
  createdAt: new Date(0).toISOString(),
  completedAt: null,
})
const input = { file: new File(['fixture'], 'pet.png'), filterId: 'fixture-filter' }
const deferred = () => {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}
const advance = async (t, ms = 3000) => {
  t.mock.timers.tick(ms)
  await flush()
}
const clock = (t) => t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })

module.exports = {
  test,
  assert,
  auth,
  load,
  ApiError,
  recovery,
  job,
  input,
  deferred,
  flush,
  advance,
  clock,
  requestAuthFixture,
}
