const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
function handoffFixture() {
  const state = { identity: 'owner-a', generation: 1, active: true, now: 1000 }
  const session = { generation: 1, identity: 'owner-a', scope: 'owner-a-1' }
  const listeners = new Map()
  const window = {
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
  }
  const auth = {
    getAuthReadSession: () =>
      state.active ? { ...session, identity: state.identity, generation: state.generation } : null,
    isAuthReadSessionCurrent: (captured) =>
      state.active &&
      captured.generation === state.generation &&
      captured.identity === state.identity,
  }
  let expire = () => {}
  const globals = {
    window,
    Date: { now: () => state.now },
    setTimeout: (callback) => {
      expire = callback
      return 1
    },
    clearTimeout() {},
  }
  const dependencies = {
    '@/shared/lib/authReadSession': auth,
    './authReadSession': auth,
    './authStateEvents': { AUTH_STATE_CHANGED: 'auth-change' },
  }
  const handoff = load('src/shared/lib/createAuthSessionHandoff.ts', dependencies, globals)
  const lib = load(
    'src/features/ai-image/lib/pendingCommunityPhoto.ts',
    { ...dependencies, '@/shared/lib/createAuthSessionHandoff': handoff },
    globals,
  )
  return {
    ...lib,
    state,
    session,
    listeners,
    expire: () => expire(),
    emit: (name, event) => listeners.get(name)?.(event),
  }
}
const photo = (name) => new File([name], `${name}.png`, { type: 'image/png' })
module.exports = { handoffFixture, photo }
