const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('./helpers/load-typescript.cjs')

function fixture() {
  const state = { token: 'owner-a:initial', generation: 1, active: true, now: 1000 }
  let timeout
  const listeners = new Map()
  const fakeWindow = {
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type)
    },
  }
  const handoff = loadTypescript(
    'src/shared/lib/createAuthSessionHandoff.ts',
    {
      './authStateEvents': { AUTH_STATE_CHANGED: 'auth-change' },
      './authReadSession': {
        getAuthReadSession: () =>
          state.token && state.active
            ? {
                identity: state.token.split(':')[0],
                generation: state.generation,
                scope: 'fixture',
              }
            : null,
        isAuthReadSessionCurrent: (session) =>
          state.active &&
          session.generation === state.generation &&
          session.identity === state.token?.split(':')[0],
      },
    },
    {
      window: fakeWindow,
      Date: { now: () => state.now },
      setTimeout: (callback) => {
        timeout = callback
        return 1
      },
      clearTimeout: () => {},
    },
  )
  const lib = loadTypescript('src/entities/community/model/pendingCommunityCard.ts', {
    '@/shared/lib/createAuthSessionHandoff': handoff,
  })
  return {
    ...lib,
    state,
    expire: () => timeout(),
    emit: (type, event) => listeners.get(type)?.(event),
    listeners,
  }
}
const photo = () => new File(['completed card'], 'card.png', { type: 'image/png' })

test('카드는 한 번만 전달하며 같은 작성자의 인증 갱신에는 유지함', () => {
  const f = fixture(),
    file = photo()
  f.setPendingCommunityCard(file)
  f.state.token = 'owner-a:refreshed'
  assert.equal(f.takePendingCommunityCard('memory-card'), file)
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})

test('계정 변경과 로그아웃 및 새로운 로그인에서는 이전 카드를 폐기함', () => {
  for (const mutate of [
    (s) => {
      s.token = 'owner-b:initial'
    },
    (s) => {
      s.active = false
    },
    (s) => {
      s.generation++
    },
  ]) {
    const f = fixture()
    f.setPendingCommunityCard(photo())
    mutate(f.state)
    assert.equal(f.takePendingCommunityCard('memory-card'), null)
    Object.assign(f.state, { token: 'owner-a:initial', generation: 1, active: true, now: 1000 })
    assert.equal(f.takePendingCommunityCard('memory-card'), null)
  }
})

test('백그라운드 타이머가 중단되어도 방치된 카드는 만료됨', () => {
  const f = fixture()
  f.setPendingCommunityCard(photo())
  f.state.now += 5 * 60_000
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
  f.setPendingCommunityCard(photo())
  f.expire()
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})

test('로그인한 작성자만 내용이 있는 PNG 카드를 전달할 수 있음', () => {
  const f = fixture()
  f.state.token = null
  assert.throws(() => f.setPendingCommunityCard(photo()), /로그인/)
  f.state.token = 'owner-a:initial'
  assert.throws(
    () => f.setPendingCommunityCard(new File([], 'card.png', { type: 'image/png' })),
    /PNG/,
  )
  assert.throws(
    () => f.setPendingCommunityCard(new File(['x'], 'card.svg', { type: 'image/svg+xml' })),
    /PNG/,
  )
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})

test('일반 글쓰기에서는 이전 카드가 다른 사진을 덮어쓰지 않도록 폐기함', () => {
  const f = fixture()
  f.setPendingCommunityCard(photo())
  assert.equal(f.takePendingCommunityCard(), null)
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
  assert.equal(f.listeners.size, 0)
})

test('다른 탭에서 같은 계정으로 재로그인해도 로그아웃 이벤트는 카드를 폐기함', () => {
  for (const key of ['pawpong:logout-pending', null]) {
    const f = fixture()
    f.setPendingCommunityCard(photo())
    // Delayed storage event: the cookie and document generation now look unchanged again.
    f.emit('storage', { key, oldValue: '1', newValue: null })
    assert.equal(f.takePendingCommunityCard('memory-card'), null)
    assert.equal(f.listeners.size, 0)
  }
})

test('인증 알림은 계정 변경 시 카드를 폐기하고 같은 작성자의 갱신은 유지함', () => {
  const f = fixture(),
    file = photo()
  f.setPendingCommunityCard(file)
  f.state.token = 'owner-a:refreshed'
  f.emit('auth-change')
  assert.equal(f.takePendingCommunityCard('memory-card'), file)
  f.setPendingCommunityCard(file)
  f.state.active = false
  f.emit('auth-change')
  f.state.active = true
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})
