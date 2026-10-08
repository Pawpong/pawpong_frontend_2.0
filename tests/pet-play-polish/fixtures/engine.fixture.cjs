const { load, room, snack, motion, settings } = require('./model.fixture.cjs')

function engineHarness() {
  const objects = []
  function object(kind, x = 0, y = 0) {
    const item = { kind, x, y, frame: 0, visible: false, rects: [], angle: 0 }
    for (const method of [
      'setOrigin',
      'setDisplaySize',
      'setTexture',
      'setSize',
      'setTint',
      'setFlipX',
      'fillTriangle',
    ])
      item[method] = () => item
    item.setDepth = (value) => ((item.depth = value), item)
    item.setVisible = (value) => ((item.visible = value), item)
    item.setPosition = (a, b) => ((item.x = a), (item.y = b), item)
    item.setY = (value) => ((item.y = value), item)
    item.setFrame = (value) => ((item.frame = value), item)
    item.setAngle = (value) => ((item.angle = value), item)
    item.clear = () => ((item.rects = []), item)
    item.fillStyle = (color) => ((item.color = color), item)
    item.fillRect = (rx, ry, w, h) => (
      item.rects.push({ x: rx, y: ry, w, h, color: item.color }),
      item
    )
    item.destroy = () => {}
    objects.push(item)
    return item
  }
  let instance
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
      instance = this
      this.isRunning = true
      this.scene = new config.scene()
      this.scene.create()
    }
    destroy() {}
    headlessStep() {}
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
    './gameAssets': { petAsset: (manifest, id) => (id ? (manifest?.assets[id] ?? null) : null) },
    './petAssetImage': require('../../fixtures/pet-assets.fixture.cjs').image,
    './petMotion': motion,
    '../constants/pet-motion': settings,
  })
  const snapshot = {
    manifest: {
      assets: Object.fromEntries(
        ['wallpaper_cream', 'floor_oak', 'toy_bone', 'toy_ball'].map((id) => [
          id,
          { url: `/playground/pet/v2/${id}.png` },
        ]),
      ),
    },
    room: { wallpaper: 'wallpaper_cream', floor: 'floor_oak' },
    characterUrl: 'blob:own-sheet',
    resting: false,
    reaction: 0,
    feedback: { action: null, stars: 0, xp: 0 },
    reducedMotion: false,
    snack: null,
    mood: null,
    highlight: null,
  }
  return {
    createPetGame,
    snapshot,
    objects,
    scene: () => instance.scene,
    fx: () => objects.filter((item) => item.kind === 'graphics').at(-1),
    hero: () => objects.find((item) => item.kind === 'sprite'),
  }
}

module.exports = { engineHarness }
