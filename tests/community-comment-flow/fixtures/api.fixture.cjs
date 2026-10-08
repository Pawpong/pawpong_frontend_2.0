const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const base = require('../../api-session-boundary/fixtures/api.fixture.cjs')
function commentApiFixture() {
  const h = base.apiFixture()
  const api = load('src/features/community/api/community.api.ts', {
    '@/shared/api': h.sharedApi,
    '@/entities/community': {},
    '../lib/communityWriteSession': {},
  })
  const read = load('src/entities/community/api/community.api.ts', {
    '@/shared/api': h.sharedApi,
    '../model/communityReview': load('src/entities/community/model/communityReview.ts'),
  })
  const { communityQueries } = load('src/entities/community/api/community.queries.ts', {
    '@/shared/api': {
      ...h.sharedApi,
      createQuery: (x) => x,
      createInfiniteQuery: (x) => x,
      STALE_TIME: {},
    },
    './community.api': read,
  })
  return { ...h, api, read, queries: communityQueries }
}
module.exports = { ...base, commentApiFixture }
