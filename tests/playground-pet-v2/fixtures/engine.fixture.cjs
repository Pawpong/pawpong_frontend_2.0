const {
  assert,
  load,
  room,
  snack,
  petAsset,
  motion,
  motionSettings,
} = require('./core.fixture.cjs')

function engineFixture(imageBehavior) {
  const previousImage = global.Image
  let instance,
    instances = 0,
    destroyed = 0
  const objects = []
  function object(kind, x = 0, y = 0) {
    const item = { kind, x, y, frame: 0, visible: false, sparkRects: 0 }
    for (const method of [
      'setOrigin',
      'setDepth',
      'setDisplaySize',
      'setTexture',
      'setSize',
      'setTint',
      'setFlipX',
      'setAngle',
      'fillStyle',
      'fillTriangle',
    ])
      item[method] = () => item
    item.setVisible = (value) => {
      item.visible = value
      return item
    }
    item.setPosition = (a, b) => {
      item.x = a
      item.y = b
      return item
    }
    item.setY = (value) => {
      item.y = value
      return item
    }
    item.setFrame = (value) => {
      item.frame = value
      return item
    }
    item.clear = () => {
      item.sparkRects = 0
      return item
    }
    item.fillRect = () => {
      item.sparkRects++
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
        addImage: () => ({ setFilter() {}, add() {} }),
        addSpriteSheet: () => ({ setFilter() {} }),
        remove() {},
      }
      this.add = Object.fromEntries(
        ['image', 'tileSprite', 'sprite', 'ellipse', 'graphics'].map((kind) => [
          kind,
          (x, y) => object(kind, x, y),
        ]),
      )
    }
  }
  class Game {
    constructor(config) {
      instances++
      instance = this
      this.isBooted = true
      this.isRunning = !config.parent.awaitBoot
      this.events = {
        once: (_name, fn) => {
          this.onReady = fn
        },
      }
      this.scene = new config.scene()
      if (this.isRunning) this.scene.create()
    }
    destroy(removeCanvas) {
      this.pendingDestroy = true
      assert.equal(removeCanvas, true)
    }
    headlessStep() {
      if (this.pendingDestroy) {
        destroyed++
        this.pendingDestroy = false
      }
    }
  }
  global.Image = class {
    set src(value) {
      if (imageBehavior) return imageBehavior(this, value)
      if (!value.includes('slow-unselected'))
        queueMicrotask(() => (value.includes('unavailable') ? this.onerror?.() : this.onload?.()))
    }
  }
  const { createPetGame } = load('src/features/playground-pet/lib/petGameEngine.ts', {
    phaser: {
      default: {
        Game,
        Scene,
        AUTO: 0,
        Core: { Events: { READY: 'ready' } },
        Textures: { FilterMode: { NEAREST: 0 } },
        Scale: { FIT: 0, CENTER_BOTH: 0 },
      },
    },
    '@/entities/playground-pet/model/room': room,
    '@/entities/playground-pet/model/snack': snack,
    './gameAssets': { petAsset },
    './petAssetImage': require('../../fixtures/pet-assets.fixture.cjs').image,
    './petMotion': motion,
    '../constants/pet-motion': motionSettings,
  })
  return {
    createPetGame,
    objects,
    get instance() {
      return instance
    },
    get instances() {
      return instances
    },
    get destroyed() {
      return destroyed
    },
    dispose() {
      global.Image = previousImage
    },
  }
}

module.exports = { engineFixture }
