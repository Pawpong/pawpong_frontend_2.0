const { engineFixture } = require('../../playground-pet-v2/fixtures/engine.fixture.cjs')

const flush = () => new Promise(setImmediate)
const snapshot = {
  manifest: {
    assets: {
      toy_bone: { url: '/playground/pet/v2/bone.png' },
      toy_ball: { url: '/playground/pet/v2/ball.png' },
    },
  },
  room: {},
  characterUrl: null,
  resting: false,
  reaction: 0,
  feedback: { action: null, stars: 0, xp: 0 },
  reducedMotion: false,
  snack: null,
}

function pendingEngine(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let stalled = true
  const images = []
  const fixture = engineFixture((image, url) => {
    images.push({ image, url })
    if (!stalled && url) queueMicrotask(() => image.onload?.())
  })
  const states = []
  const handle = fixture.createPetGame({}, snapshot, (value) => states.push(value))
  t.after(() => {
    handle.destroy()
    fixture.dispose()
  })
  return {
    handle,
    states,
    images,
    fixture,
    recover: () => {
      stalled = false
    },
  }
}

module.exports = { flush, snapshot, pendingEngine }
