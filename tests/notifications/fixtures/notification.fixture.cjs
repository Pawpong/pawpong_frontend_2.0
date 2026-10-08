const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const token = (sub, revision = 1) =>
  `fixture.${Buffer.from(JSON.stringify({ sub, role: 'adopter', iat: revision })).toString('base64url')}.fixture`
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function notificationFixture(get = async () => ({ data: { unreadCount: 7 } })) {
  const state = { token: token('account-a'), generation: 1, active: true, refreshes: 0, notices: 0 }
  const identity = load('src/shared/lib/authTokenIdentity.ts')
  const session = load('src/shared/lib/authReadSession.ts', {
    '@/shared/api/token': { getAccessToken: () => state.token },
    './authTokenIdentity': identity,
    './authSessionLifecycle': {
      getAuthSessionGeneration: () => state.generation,
      isAuthSessionCurrent: (generation) => state.active && state.generation === generation,
    },
  })
  const { ApiError } = load('src/shared/api/unwrap.ts')
  const api = load('src/entities/notification/api/notification.api.ts', {
    '@/shared/api': {
      apiClient: { get },
      API_VERSION: '/api/v2',
      unwrap: (response) => response.data,
    },
    '@/shared/api/token': { getAccessToken: () => state.token },
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authReadSession': session,
    '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => state.notices++ },
    '@/shared/lib/authSessionRecovery': {
      refreshAuthSession: async () => {
        state.refreshes++
        state.token = token('account-a', 2)
        return state.token
      },
    },
  })
  return { state, session, api, ApiError }
}

module.exports = { load, token, deferred, notificationFixture }
