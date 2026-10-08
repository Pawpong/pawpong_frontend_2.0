const { notificationFixture, load, token, deferred } = require('../../notifications/fixtures/notification.fixture.cjs')

function communitySessionFixture(get) {
  const h = notificationFixture(get)
  const api = load('src/entities/community/api/community.api.ts', {
    '@/shared/api': {
      apiClient: { get }, API_VERSION: '/api/v2', unwrap: value => value.data,
      withAuthReadSession: h.withAuthReadSession,
      getAuthReadSession: h.session.getAuthReadSession,
    },
    '../model/communityReview': load('src/entities/community/model/communityReview.ts'),
  })
  const { communityQueries } = load('src/entities/community/api/community.queries.ts', {
    '@/shared/api': {
      createQuery: options => options, createInfiniteQuery: options => options,
      STALE_TIME: { DEFAULT: 300_000 }, getAuthReadSession: h.session.getAuthReadSession,
    },
    './community.api': api,
  })
  return { ...h, api, queries: communityQueries }
}

const page = () => ({ data: { items: [], pagination: { currentPage: 1, hasNextPage: false } } })
module.exports = { communitySessionFixture, token, deferred, page }
