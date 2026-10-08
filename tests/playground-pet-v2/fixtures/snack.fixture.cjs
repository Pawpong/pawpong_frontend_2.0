const { load, snack, sessionId } = require('./core.fixture.cjs')
const { effectHarness, elementNodes } = require('./effects.fixture.cjs')

function snackUiHarness() {
  const previous = {
    window: global.window,
    document: global.document,
    performance: Object.getOwnPropertyDescriptor(global, 'performance'),
    raf: global.requestAnimationFrame,
    cancel: global.cancelAnimationFrame,
  }
  const runtime = effectHarness(),
    timers = new Set(),
    listeners = new Map()
  let time = 0,
    key = 0
  const doc = {
    hidden: false,
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name).add(fn)
    },
    removeEventListener(name, fn) {
      listeners.get(name)?.delete(fn)
    },
  }
  global.document = doc
  global.window = {
    setInterval(fn) {
      timers.add(fn)
      return fn
    },
    clearInterval(fn) {
      timers.delete(fn)
    },
  }
  Object.defineProperty(global, 'performance', { configurable: true, value: { now: () => time } })
  global.requestAnimationFrame = () => 1
  global.cancelAnimationFrame = () => {}
  const { PetMiniGames } = load('src/features/playground-pet/ui/PetMiniGames.tsx', {
    react: runtime.react,
    'react-dom': { createPortal: (node) => node },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/entities/playground-pet/model/snack': snack,
    '../lib/useServerClock': { petRequestKey: () => `explicit-key-${++key}` },
    './PetGlyph': { PetGlyph: () => null },
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, name) => String(name) }) },
  })
  const stamp = '2026-10-05T00:00:00Z'
  const session = {
    sessionId,
    game: 'snack',
    status: 'active',
    startedAt: stamp,
    expiresAt: '2026-10-05T00:04:00Z',
    durationMs: 30000,
    laneCount: 3,
    initialLane: 1,
    drops: [],
    rewardEligible: true,
  }
  const snapshots = []
  const props = {
    game: {
      wallet: { stars: 50, dailyEarned: 0, dailyLimit: 90 },
      games: {
        active: null,
        rewardedToday: 0,
        dailyRewardLimit: 3,
        bestScores: { memory: 0, snack: 0 },
      },
    },
    gameOutcome: null,
    revision: 7,
    serverTime: stamp,
    now: Date.parse(stamp),
    disabled: false,
    characterReady: true,
    gameSurface: null,
    onRefresh() {},
    onSnack: (value) => snapshots.push(value),
    onPrepareGame: async () => true,
    onCommand() {},
  }
  const render = () => {
    const tree = runtime.render(() => PetMiniGames(props))
    runtime.flush()
    return elementNodes(tree)
  }
  return {
    props,
    session,
    render,
    timers,
    listeners,
    snapshots,
    activate() {
      props.game = { ...props.game, games: { ...props.game.games, active: session } }
    },
    tick(value) {
      time = value
      props.now = Date.parse(stamp) + value
      timers.forEach((fn) => fn())
    },
    visibility(hidden) {
      doc.hidden = hidden
      listeners.get('visibilitychange')?.forEach((fn) => fn())
    },
    dispose() {
      runtime.unmount()
      global.window = previous.window
      global.document = previous.document
      Object.defineProperty(global, 'performance', previous.performance)
      global.requestAnimationFrame = previous.raf
      global.cancelAnimationFrame = previous.cancel
    },
  }
}

module.exports = { snackUiHarness }
