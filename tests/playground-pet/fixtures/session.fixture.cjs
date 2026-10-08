const { load, ApiError, unwrap, requestAuthFixture } = require('./core.fixture.cjs')

function petSessionHarness() {
  const state = { token: 'fixture-account-a', generation: 1, refreshes: 0, notifications: 0 }
  const lifecycle = {
    getAuthSessionGeneration: () => state.generation,
    isAuthSessionCurrent: (generation) => generation === state.generation,
  }
  const token = { getAccessToken: () => state.token }
  const recovery = {
    refreshAuthSession: async () => {
      state.refreshes++
      return state.token
    },
  }
  const { apiClient } = load('src/shared/api/client.ts', {
    axios: require('axios'),
    './unwrap': { ApiError },
    './token': token,
    './requestAuthScope': requestAuthFixture(token, lifecycle),
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
    '@/shared/lib/authStateEvents': {
      AUTH_STATE_CHANGED: 'auth',
      notifyAuthStateChanged: () => state.notifications++,
    },
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
  })
  return {
    state,
    apiClient,
    api,
    auth,
    recovery,
    session: { token: state.token, generation: 1, scope: 'fixture-account-a' },
  }
}

module.exports = { petSessionHarness }
