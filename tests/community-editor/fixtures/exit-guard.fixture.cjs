const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
function exitGuardFixture(hasChanges = true) {
  const listeners = new Map(),
    cleanups = [],
    state = [],
    history = []
  const window = {
    location: { href: 'https://example.invalid/community/write' },
    history: {
      state: { __NA: true },
      pushState: (value) => history.push(['push', value]),
      back: () => history.push(['back']),
      go: (amount) => history.push(['go', amount]),
    },
    addEventListener: (name, handler, capture = false) =>
      listeners.set(`${name}:${capture}`, handler),
    removeEventListener: (name, _handler, capture = false) =>
      listeners.delete(`${name}:${capture}`),
  }
  const hook = load(
    'src/shared/lib/useExitGuard.ts',
    {
      react: {
        useRef: (value) => ({ current: value }),
        useState: (value) => [value, (next) => state.push(next)],
        useCallback: (callback) => callback,
        useEffect: (callback) => cleanups.push(callback()),
      },
    },
    { window },
  ).useExitGuard({ hasChanges })
  return {
    hook,
    history,
    state,
    location: window.location,
    pop: () => {
      let stopped = false
      const event = {
        preventDefault() {},
        stopImmediatePropagation() {
          stopped = true
        },
      }
      listeners.get('popstate:true')?.(event)
      if (!stopped) listeners.get('popstate:false')?.(event)
      return stopped
    },
    cleanup: () => cleanups.forEach((value) => value?.()),
  }
}
module.exports = { exitGuardFixture }
