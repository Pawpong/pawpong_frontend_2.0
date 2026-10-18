const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const { createBrowser, until } = require('./fixtures/browser.fixture.cjs')

test('이전 로그아웃 완료가 새 계정의 화면을 홈으로 이동시키지 않음', async () => {
  const browser = createBrowser(), tab = browser.tab()
  const scope = tab.load('src/shared/lib/authCookieScope.ts')
  const destinations = []
  let finished = false
  const { useLogoutAndRedirect } = load('src/features/auth/lib/useLogoutAndRedirect.ts', {
    react: { useCallback: callback => callback },
    '../api/auth.mutations': { useLogout: () => ({ mutateAsync: async () => { finished = true; throw new scope.AuthCookieSessionChangedError() }, isPending: false }) },
    '@/shared/lib/authCookieScope': scope,
  }, { window: { location: { assign: url => destinations.push(url) } } })
  useLogoutAndRedirect().logoutAndRedirect()
  await until(() => finished)
  await Promise.resolve()
  assert.deepEqual(destinations, [])
})

test('현재 계정의 서버 로그아웃 장애는 기존처럼 홈으로 복귀함', async () => {
  const browser = createBrowser(), tab = browser.tab()
  const destinations = []
  const { useLogoutAndRedirect } = load('src/features/auth/lib/useLogoutAndRedirect.ts', {
    react: { useCallback: callback => callback },
    '../api/auth.mutations': { useLogout: () => ({ mutateAsync: async () => { throw new Error('합성 통신 오류') }, isPending: false }) },
    '@/shared/lib/authCookieScope': tab.load('src/shared/lib/authCookieScope.ts'),
  }, { window: { location: { assign: url => destinations.push(url) } } })
  useLogoutAndRedirect().logoutAndRedirect()
  await until(() => destinations.length > 0)
  assert.deepEqual(destinations, ['/'])
})
