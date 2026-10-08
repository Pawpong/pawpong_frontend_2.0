const axios = require('axios')
const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const token = (sub, revision = 1) =>
  `fixture.${Buffer.from(JSON.stringify({ sub, role: 'adopter', iat: revision })).toString('base64url')}.fixture`
function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function apiFixture() {
  const state = {
    token: token('owner-a'),
    generation: 1,
    active: true,
    refreshes: 0,
    redirects: [],
  }
  const tokens = { getAccessToken: () => state.token }
  const lifecycle = {
    getAuthSessionGeneration: () => state.generation,
    isAuthSessionCurrent: (value) => state.active && value === state.generation,
  }
  const identity = load('src/shared/lib/authTokenIdentity.ts')
  const session = load('src/shared/lib/authReadSession.ts', {
    '@/shared/api/token': tokens,
    './authTokenIdentity': identity,
    './authSessionLifecycle': lifecycle,
  })
  const unwrap = load('src/shared/api/unwrap.ts')
  const recovery = {
    refreshAuthSession: async () => {
      state.refreshes++
      state.token = token('owner-a', 2)
      return state.token
    },
  }
  const scope = load('src/shared/api/requestAuthScope.ts', {
    './token': tokens,
    '../lib/authTokenIdentity': identity,
    '../lib/authSessionLifecycle': lifecycle,
  })
  const { apiClient } = load(
    'src/shared/api/client.ts',
    {
      axios,
      './unwrap': unwrap,
      './token': tokens,
      './requestAuthScope': scope,
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/authSessionRecovery': recovery,
      '@/shared/config/apiBaseUrl': { getApiBaseUrl: () => 'https://api.invalid' },
      '@/shared/config/apiDiagnosticRoutes': { API_DIAGNOSTIC_ROUTES: [] },
    },
    {
      window: {
        location: {
          pathname: '/ai-filter',
          search: '',
          replace: (url) => state.redirects.push(url),
        },
      },
    },
  )
  const deps = {
    './token': tokens,
    './unwrap': unwrap,
    '../lib/authReadSession': session,
    './authWriteRetryRequiredError': load('src/shared/api/authWriteRetryRequiredError.ts', {
      './unwrap': unwrap,
    }),
    '../lib/authStateEvents': { notifyAuthStateChanged() {} },
    '../lib/authSessionRecovery': recovery,
  }
  const reads = load('src/shared/api/authReadRequest.ts', deps)
  const writes = load('src/shared/api/authWriteRequest.ts', deps)
  const api = load('src/entities/ai-image/api/aiImage.api.ts', {
    '@/shared/api': {
      apiClient,
      API_VERSION: '/api/v2',
      ...unwrap,
      ...reads,
      ...writes,
      ...session,
      ...tokens,
    },
    '@/shared/lib/authReadSession': session,
  })
  return { state, apiClient, api, session, recovery, ApiError: unwrap.ApiError }
}
function unauthorized(config) {
  throw new axios.AxiosError('인증 만료', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    data: { message: '인증 만료' },
    config,
    headers: {},
    statusText: 'Unauthorized',
  })
}
const response = (config, data = { accepted: true }) => ({
  status: 200,
  data: { success: true, data },
  config,
})
module.exports = { apiFixture, token, deferred, unauthorized, response }
