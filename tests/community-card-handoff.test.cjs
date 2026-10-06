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
  const lib = loadTypescript(
    'src/entities/community/model/pendingCommunityCard.ts',
    {
      '@/shared/lib/authStateEvents': { AUTH_STATE_CHANGED: 'auth-change' },
      '@/shared/api/token': { getAccessToken: () => state.token },
      '@/shared/lib/authTokenIdentity': {
        authTokenIdentity: (token) => token?.split(':')[0] ?? null,
      },
      '@/shared/lib/authSessionLifecycle': {
        getAuthSessionGeneration: () => state.generation,
        isAuthSessionCurrent: (generation) => state.active && generation === state.generation,
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
  return {
    ...lib,
    state,
    expire: () => timeout(),
    emit: (type, event) => listeners.get(type)?.(event),
    listeners,
  }
}
const photo = () => new File(['completed card'], 'card.png', { type: 'image/png' })

test('a card is delivered once and credential refresh for the same author preserves it', () => {
  const f = fixture(),
    file = photo()
  f.setPendingCommunityCard(file)
  f.state.token = 'owner-a:refreshed'
  assert.equal(f.takePendingCommunityCard('memory-card'), file)
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})

test('switching accounts, logout and a new login generation discard the previous card', () => {
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

test('abandoned cards expire even when background timers were suspended', () => {
  const f = fixture()
  f.setPendingCommunityCard(photo())
  f.state.now += 5 * 60_000
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
  f.setPendingCommunityCard(photo())
  f.expire()
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
})

test('only a signed-in author can hand off a nonempty PNG', () => {
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

test('an ordinary or AI write route discards the old card instead of replacing its requested photo', () => {
  const f = fixture()
  f.setPendingCommunityCard(photo())
  assert.equal(f.takePendingCommunityCard(), null)
  assert.equal(f.takePendingCommunityCard('memory-card'), null)
  assert.equal(f.listeners.size, 0)
})

test('cross-tab logout discards the card even after that tab logs back into the same account', () => {
  for (const key of ['pawpong:logout-pending', null]) {
    const f = fixture()
    f.setPendingCommunityCard(photo())
    // Delayed storage event: the cookie and document generation now look unchanged again.
    f.emit('storage', { key, oldValue: '1', newValue: null })
    assert.equal(f.takePendingCommunityCard('memory-card'), null)
    assert.equal(f.listeners.size, 0)
  }
})

test('auth notifications dispose on account boundaries but keep an ordinary same-owner refresh', () => {
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
