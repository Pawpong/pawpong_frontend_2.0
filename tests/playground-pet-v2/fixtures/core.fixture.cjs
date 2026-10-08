const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const axios = require('axios')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

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
const { ApiError, unwrap } = load('src/shared/api/unwrap.ts')
const { PetCommandQueue } = load('src/entities/playground-pet/model/commandQueue.ts')
const snack = load('src/entities/playground-pet/model/snack.ts')
const room = load('src/entities/playground-pet/model/room.ts')
const { PetCharacterResource, validatePetSheetPixels } = load(
  'src/features/playground-pet/lib/characterResource.ts',
)
const { petAsset, loadPetAssets } = load('src/features/playground-pet/lib/gameAssets.ts')
const motionSettings = load('src/features/playground-pet/constants/pet-motion.ts')
const motion = load('src/features/playground-pet/lib/petMotion.ts', {
  '../constants/pet-motion': motionSettings,
})

function sessionHarness() {
  const state = { token: 'fixture-owner-a', generation: 1, refreshes: 0, notifications: 0 }
  const token = { getAccessToken: () => state.token }
  const lifecycle = {
    getAuthSessionGeneration: () => state.generation,
    isAuthSessionCurrent: (generation) => state.generation === generation,
  }
  const recovery = {
    refreshAuthSession: async () => {
      state.refreshes++
      state.token = 'fixture-refreshed-owner-a'
      return state.token
    },
  }
  const { apiClient } = load('src/shared/api/client.ts', {
    axios,
    './unwrap': { ApiError },
    './token': token,
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/config/apiBaseUrl': { getApiBaseUrl: () => 'http://fixture.invalid' },
  })
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': { apiClient, API_VERSION: '/api/v2' },
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError, unwrap },
  })
  const auth = load('src/features/playground-pet/lib/usePetSession.ts', {
    react: {},
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/lib/authStateEvents': {
      AUTH_STATE_CHANGED: 'auth',
      notifyAuthStateChanged: () => state.notifications++,
    },
  })
  return {
    state,
    apiClient,
    api,
    auth,
    session: { token: state.token, generation: 1, scope: 'fixture-a' },
  }
}
const base = { expectedRevision: 7, idempotencyKey: 'fixture-key-0001' }
const sessionId = '367ae6c6-98a7-4f4b-b4be-6cb494c1e712'
const commands = [
  { kind: 'items/purchase', body: { ...base, itemId: 'toy_bone' } },
  { kind: 'room', body: { ...base, slot: 'toy', itemId: null } },
  { kind: 'games/start', body: { ...base, game: 'memory' } },
  { kind: 'games/cancel', body: { ...base, sessionId } },
  { kind: 'games/memory/flip', body: { ...base, sessionId, index: 3 } },
  {
    kind: 'games/snack/finish',
    body: {
      ...base,
      sessionId,
      inputs: [
        { tMs: 150, lane: 2 },
        { tMs: 500, lane: 1 },
      ],
    },
  },
]

module.exports = {
  test,
  assert,
  fs,
  ts,
  axios,
  React,
  renderToStaticMarkup,
  load,
  ApiError,
  unwrap,
  PetCommandQueue,
  snack,
  room,
  PetCharacterResource,
  validatePetSheetPixels,
  petAsset,
  loadPetAssets,
  motionSettings,
  motion,
  sessionHarness,
  base,
  sessionId,
  commands,
}
