const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const base = require('../../api-session-boundary/fixtures/api.fixture.cjs')

function answerApiFixture() {
  const h = base.apiFixture()
  const api = load('src/entities/community/api/communityExperience.api.ts', {
    '@/shared/api': h.sharedApi,
    '@/shared/api/token': h.tokens,
    '@/shared/lib/authSessionLifecycle': h.lifecycle,
  })
  return { ...h, api }
}

module.exports = { ...base, answerApiFixture }
