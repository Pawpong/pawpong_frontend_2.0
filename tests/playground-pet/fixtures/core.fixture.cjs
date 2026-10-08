const { test } = require('node:test')
const assert = require('node:assert/strict')
const { requestAuthFixture } = require('../../fixtures/request-auth.fixture.cjs')
const fs = require('node:fs')
const ts = require('typescript')
function load(file, deps = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('exports', 'require', code)(exports, (name) => {
    if (name === '@/shared/config/apiDiagnosticRoutes') {
      return load('src/shared/config/apiDiagnosticRoutes.ts')
    }
    if (!(name in deps)) throw new Error(`Missing dependency ${name}`)
    return deps[name]
  })
  return exports
}
const { isPetEnvironmentAllowed, petExposureMode } = load(
  'src/features/playground-pet/lib/environment.ts',
)
const presentation = load('src/entities/playground-pet/model/presentation.ts')
const { PetCommandQueue } = load('src/entities/playground-pet/model/commandQueue.ts')
const { ApiError, unwrap } = load('src/shared/api/unwrap.ts')
const env = {
  appEnv: 'development',
  enabled: 'true',
  deploymentEnv: 'preview',
  branch: 'dev',
  hostname: 'dev.pawpong.kr',
}
const command = {
  kind: 'actions',
  body: { action: 'feed', expectedRevision: 7, idempotencyKey: 'fixture-request-001' },
}
const view = (revision) => ({
  pet: { id: 'pet-1', revision, level: 3, totalXp: 83, xpForCurrentLevel: 80, xpForNextLevel: 180 },
  serverTime: '2026-10-03T12:00:00.000Z',
})

module.exports = {
  test,
  assert,
  load,
  ApiError,
  unwrap,
  presentation,
  PetCommandQueue,
  isPetEnvironmentAllowed,
  petExposureMode,
  env,
  command,
  view,
  requestAuthFixture,
}
