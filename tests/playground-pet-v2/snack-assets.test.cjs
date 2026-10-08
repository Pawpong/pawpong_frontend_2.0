const {
  test,
  assert,
  ts,
  load,
  snack,
  room,
  petAsset,
  motionSettings,
  motion,
  sessionId,
} = require('./fixtures/core.fixture.cjs')

test('간식 에셋 실패는 같은 세션에서 다시 읽고 선택한 게임 에셋만 준비함', async () => {
  const previousImage = global.Image,
    objects = [],
    requests = [],
    textures = new Map()
  let failBall = true,
    instance,
    instances = 0
  const object = (kind, x, y, texture) => {
    const item = { kind, x, y, texture, visible: false }
    for (const method of [
      'setOrigin',
      'setDisplaySize',
      'setSize',
      'fillStyle',
      'fillRect',
      'fillTriangle',
      'clear',
      'setFrame',
      'setFlipX',
      'setAngle',
    ])
      item[method] = () => item
    for (const [method, field] of [
      ['setDepth', 'depth'],
      ['setTexture', 'texture'],
      ['setVisible', 'visible'],
      ['setTint', 'tint'],
      ['setY', 'y'],
    ])
      item[method] = (value) => {
        item[field] = value
        return item
      }
    item.setPosition = (x, y) => {
      item.x = x
      item.y = y
      return item
    }
    item.destroy = () => {
      item.destroyed = true
    }
    objects.push(item)
    return item
  }
  class Scene {
    constructor() {
      this.cameras = { main: { setBackgroundColor() {} } }
      this.textures = {
        addImage(key, image) {
          textures.set(key, image.url)
          return { setFilter() {}, add() {} }
        },
        addSpriteSheet: () => ({ setFilter() {} }),
        remove() {},
      }
      this.add = Object.fromEntries(
        ['image', 'tileSprite', 'sprite', 'ellipse', 'graphics'].map((kind) => [
          kind,
          (x, y, texture) => object(kind, x, y, texture),
        ]),
      )
    }
  }
  class Game {
    constructor(config) {
      instance = this
      instances++
      this.isRunning = true
      this.scene = new config.scene()
      this.scene.create()
    }
    destroy() {}
    headlessStep() {}
  }
  global.Image = class {
    set src(url) {
      this.url = url
      requests.push(url)
      queueMicrotask(() => (url.includes('ball') && failBall ? this.onerror?.() : this.onload?.()))
    }
  }
  try {
    const { createPetGame } = load('src/features/playground-pet/lib/petGameEngine.ts', {
      phaser: {
        default: {
          Game,
          Scene,
          AUTO: 0,
          Textures: { FilterMode: { NEAREST: 0 } },
          Scale: { FIT: 0, CENTER_BOTH: 0 },
        },
      },
      '@/entities/playground-pet/model/room': room,
      '@/entities/playground-pet/model/snack': snack,
      './gameAssets': { petAsset },
      './petAssetImage': require('../fixtures/pet-assets.fixture.cjs').image,
      './petMotion': motion,
      '../constants/pet-motion': motionSettings,
    })
    const snapshot = {
      room: { wallpaper: 'wallpaper_cream', floor: 'floor_oak' },
      manifest: {
        assets: Object.fromEntries(
          ['wallpaper_cream', 'floor_oak', 'toy_bone', 'toy_ball', 'unused_shop_item'].map((id) => [
            id,
            { url: `/playground/pet/v2/${id}.png` },
          ]),
        ),
      },
      characterUrl: 'blob:certified-six-frame-sheet',
      resting: false,
      reaction: 0,
      feedback: { action: null, xp: 0, stars: 0 },
      reducedMotion: false,
      snack: null,
    }
    const states = [],
      handle = createPetGame({}, snapshot, (state) => states.push(state))
    await new Promise(setImmediate)
    assert.equal(states.at(-1), 'ready')
    assert.equal(
      requests.some((url) => url.includes('toy_')),
      false,
    )
    assert.equal(await handle.prepareGame('snack'), false)
    assert.equal(states.at(-1), 'error')
    assert.equal(
      requests.some((url) => url.includes('unused_shop')),
      false,
    )
    const active = {
      session: {
        sessionId,
        drops: [
          { kind: 'snack', lane: 0, landingAtMs: 1000 },
          { kind: 'hazard', lane: 1, landingAtMs: 1500 },
        ],
      },
      elapsed: 0,
      lane: 1,
    }
    handle.sync({ ...snapshot, snack: active })
    handle.retry()
    await new Promise(setImmediate)
    const drops = objects.filter((item) => item.depth === 30),
      hazard = drops[1]
    assert.equal(states.at(-1), 'error')
    assert.equal(hazard.texture, '__WHITE')
    assert.equal(hazard.visible, false)
    failBall = false
    handle.retry()
    await new Promise(setImmediate)
    assert.equal(states.at(-1), 'ready')
    assert.equal(objects.filter((item) => item.depth === 30).length, 2)
    assert.equal(textures.get(drops[0].texture), '/playground/pet/v2/toy_bone.png')
    assert.equal(textures.get(hazard.texture), '/playground/pet/v2/toy_ball.png')
    assert.equal(hazard.tint, 0xb3443c)
    instance.scene.update(1000)
    assert.equal(hazard.visible, true)
    assert.equal(await handle.prepareGame('snack'), true)
    assert.equal(instances, 1)
    handle.destroy()
    assert.equal(await handle.prepareGame('snack'), false)
  } finally {
    global.Image = previousImage
  }
})
