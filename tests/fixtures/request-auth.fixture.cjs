const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

function requestAuthFixture(tokens, lifecycle) {
  return load('src/shared/api/requestAuthScope.ts', {
    './token': tokens,
    '../lib/authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts'),
    '../lib/authSessionLifecycle': lifecycle,
  })
}

module.exports = { requestAuthFixture }
