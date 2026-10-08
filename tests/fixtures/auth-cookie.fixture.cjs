const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

function authCookieFixture(tokens, lifecycle) {
  return {
    lock: load('src/shared/lib/authCookieLock.ts', {}, { navigator: {} }),
    scope: load('src/shared/lib/authCookieScope.ts', {
      '@/shared/api/token': tokens,
      '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
      './authSessionLifecycle': lifecycle,
      './authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts'),
    }),
  }
}

module.exports = { authCookieFixture }
