const {
  notificationFixture,
  token,
  deferred,
  load,
} = require('../../notifications/fixtures/notification.fixture.cjs')

function aiSessionFixture(
  get = async () => ({ data: [] }),
  remove = async () => ({ data: { hidden: true } }),
) {
  const h = notificationFixture()
  const api = load('src/entities/ai-image/api/aiImage.api.ts', {
    '@/shared/api': {
      apiClient: { get, delete: remove },
      API_VERSION: '/api/v2',
      unwrap: (response) => response.data,
      getAuthReadSession: h.session.getAuthReadSession,
      withAuthReadSession: h.withAuthReadSession,
      getAccessToken: () => h.state.token,
      ApiError: h.ApiError,
    },
    '@/shared/lib/authReadSession': h.session,
    '@/shared/api/token': { getAccessToken: () => h.state.token },
    '@/shared/api/unwrap': { ApiError: h.ApiError },
  })
  const { aiImageQueries } = load('src/entities/ai-image/api/aiImage.queries.ts', {
    '@tanstack/react-query': { queryOptions: (options) => options },
    '@/shared/api': {
      createQuery: (options) => options,
      STALE_TIME: { LONG: 300000, REALTIME: 0 },
      getAuthReadSession: h.session.getAuthReadSession,
    },
    './aiImage.api': api,
  })
  return { ...h, api, queries: aiImageQueries }
}

module.exports = { aiSessionFixture, token, deferred, load }
