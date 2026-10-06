const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadModule: load } = require('./helpers/load-module.cjs')

const mood = load('src/entities/playground-pet/model/mood.ts')
const room = load('src/entities/playground-pet/model/room.ts')
const snack = load('src/entities/playground-pet/model/snack.ts')
const settings = load('src/features/playground-pet/constants/pet-motion.ts')
const motion = load('src/features/playground-pet/lib/petMotion.ts', {
  '../constants/pet-motion': settings,
})
const stats = (extra = {}) => ({ fullness: 60, mood: 60, energy: 60, affinity: 0, ...extra })

test('기분은 서버 수치만 읽고 필요한 돌봄 하나를 우선순위대로 알려 준다', () => {
  assert.equal(mood.petMood(stats(), false), null)
  assert.deepEqual(
    [
      mood.petMood(stats({ fullness: 10, energy: 10, mood: 10 }), false),
      mood.petMood(stats({ energy: 10, mood: 10 }), false),
      mood.petMood(stats({ mood: 10 }), false),
    ].map((value) => [value.kind, value.action]),
    [
      ['hungry', 'feed'],
      ['sleepy', 'rest'],
      ['bored', 'play'],
    ],
  )
  const happy = mood.petMood(stats({ fullness: 90, mood: 90, energy: 80 }), false)
  assert.equal(happy.kind, 'happy')
  assert.equal(happy.action, null)
  // 쉬는 동안에는 낮은 수치여도 다른 돌봄을 재촉하지 않는다.
  assert.equal(mood.petMood(stats({ fullness: 0 }), true).kind, 'resting')
})

test('레벨업 알림은 같은 친구의 서버 레벨이 오른 순간에만 뜬다', () => {
  assert.equal(mood.petLevelUp(null, { id: 'a', level: 3 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 2 }, { id: 'a', level: 3 }), 3)
  assert.equal(mood.petLevelUp({ id: 'a', level: 3 }, { id: 'a', level: 3 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 3 }, { id: 'a', level: 2 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 1 }, { id: 'b', level: 5 }), null)
  assert.equal(mood.formatPetCountdown(0), '0:00')
  assert.equal(mood.formatPetCountdown(899.9), '14:59')
  assert.equal(mood.formatPetCountdown(-4), '0:00')
})

test('슬롯 핫스팟은 방 안에 있고 가구가 그려지는 자리와 같다', () => {
  assert.deepEqual(Object.keys(room.PET_SLOT_AREAS).sort(), [...room.PET_SLOTS].sort())
  for (const area of Object.values(room.PET_SLOT_AREAS)) {
    assert.ok(area.x >= 0 && area.y >= 0)
    assert.ok(area.x + area.width <= 320 && area.y + area.height <= 224)
  }
  for (const [slot, position] of Object.entries(room.PET_SLOT_POSITIONS)) {
    const area = room.PET_SLOT_AREAS[slot]
    assert.equal(area.x + area.width / 2, position.x)
    assert.equal(area.y + area.height, position.y)
  }
  assert.deepEqual(room.petStagePoint(0.5, 0.5), { x: 160, y: 112 })
  assert.equal(room.petStagePoint(1.2, 0.5), null)
  assert.equal(room.petStagePoint(Number.NaN, 0.5), null)
})

test('간식 터치는 한 칸 이동이며 낙하 연출 판정은 서버 재생 규칙과 같다', () => {
  assert.equal(snack.snackTapDirection(0.1), -1)
  assert.equal(snack.snackTapDirection(0.9), 1)
  const session = {
    drops: [
      { lane: 1, landingAtMs: 2000, kind: 'snack' },
      { lane: 2, landingAtMs: 3000, kind: 'hazard' },
      { lane: 0, landingAtMs: 4000, kind: 'snack' },
    ],
  }
  const inputs = [{ tMs: 2500, lane: 2 }]
  const lanes = [1, 2, 2]
  const results = session.drops.map((drop, index) => snack.snackDropResult(drop, lanes[index]))
  assert.deepEqual(results, ['catch', 'hazard', 'miss'])
  const preview = snack.previewSnack(session, inputs, 30_000)
  assert.equal(preview.catches, results.filter((value) => value === 'catch').length)
  assert.equal(preview.hazards, results.filter((value) => value === 'hazard').length)
  assert.equal(preview.misses, results.filter((value) => value === 'miss').length)
  assert.equal(snack.snackDropResult({ lane: 0, kind: 'hazard' }, 1), 'dodge')
  // 터치도 기존 입력 규칙(80ms 간격·인접 칸·범위)을 그대로 지난다.
  assert.equal(
    snack.nextSnackInput([{ tMs: 100, lane: 2 }], 2, snack.snackTapDirection(0.9), 400),
    null,
  )
  assert.equal(
    snack.nextSnackInput([{ tMs: 100, lane: 2 }], 2, snack.snackTapDirection(0.1), 150),
    null,
  )
})

test('부르면 바닥의 안전한 범위로만 걸어오고 휴식·간식 중에는 움직이지 않는다', () => {
  const { bounds } = settings.PET_ROOM_MOTION
  const start = motion.initialPetMotion()
  const called = motion.callPetTo(start, { x: 400, y: 10 })
  assert.equal(called.targetX, bounds.right)
  assert.equal(called.targetY, bounds.top)
  let state = called
  for (let index = 0; index < 60; index++)
    state = motion.advancePetMotion(
      state,
      { time: index * 33, delta: 33, resting: false, reducedMotion: false, reacting: false },
      () => 0.5,
    )
  assert.ok(state.x > start.x)
  assert.ok(state.x <= bounds.right)
  const busy = { ...start, mode: 'snack' }
  assert.equal(motion.callPetTo(busy, { x: 100, y: 190 }), busy)
  assert.equal(
    motion.callPetTo({ ...start, mode: 'bed' }, { x: 100, y: 190 }).targetX,
    start.targetX,
  )
})

test('가끔 장착한 소품 근처로 산책하되 범위를 벗어나지 않는다', () => {
  const { bounds } = settings.PET_ROOM_MOTION
  const values = [0, 0, 0.5]
  let cursor = 0
  const next = motion.advancePetMotion(
    motion.initialPetMotion(),
    {
      time: 10_000,
      delta: 33,
      resting: false,
      reducedMotion: false,
      reacting: false,
      visits: [{ x: 300, y: 190 }],
    },
    () => values[cursor++ % values.length],
  )
  assert.equal(next.targetX, bounds.right)
  assert.equal(next.targetY, 190)
})

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

test('방을 누르면 캐릭터는 폴짝 반응하고 바닥은 부르기, 게임·휴식·준비 전에는 반응하지 않는다', async () => {
  const previousImage = global.Image
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    assert.equal(handle.poke(130, 170), null) // 아직 준비 전
    await new Promise(setImmediate)
    harness.scene().update(1000, 33)
    const hero = harness.hero()
    assert.equal(handle.poke(hero.x, hero.y - 28), 'pet')
    harness.scene().update(1200, 33)
    assert.ok(hero.y < 196, '쓰다듬으면 폴짝 뛴다')
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe9778a),
      '하트가 뜬다',
    )
    assert.equal(handle.poke(10, 40), null) // 벽은 부르기 대상이 아니다
    assert.equal(handle.poke(180, 200), 'call')
    handle.sync({ ...harness.snapshot, resting: true })
    assert.equal(handle.poke(hero.x, hero.y - 28), null)
    handle.sync({ ...harness.snapshot, reducedMotion: true })
    assert.equal(handle.poke(180, 200), null) // 움직임 감소: 자동 이동 없음
    handle.destroy()
    assert.equal(handle.poke(180, 200), null)
  } finally {
    global.Image = previousImage
  }
})

test('기분 말풍선·미리보기 강조·행동 반응은 그림만 바꾸고 움직임 감소에서는 깜빡이지 않는다', async () => {
  const previousImage = global.Image
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    await new Promise(setImmediate)
    harness.scene().update(1000, 33)
    assert.equal(harness.fx().rects.length, 0)
    handle.sync({ ...harness.snapshot, mood: 'hungry' })
    harness.scene().update(1000, 33)
    assert.ok(harness.fx().rects.length > 4, '배고픔 말풍선')
    harness.scene().update(5000, 33)
    assert.equal(harness.fx().rects.length, 0, '말풍선은 계속 떠 있지 않는다')
    handle.sync({ ...harness.snapshot, highlight: 'bed' })
    harness.scene().update(8000, 33)
    const area = room.PET_SLOT_AREAS.bed
    assert.ok(
      harness.fx().rects.some((rect) => rect.x === area.x && rect.y === area.y),
      '미리보기 슬롯 모서리 표시',
    )
    harness.scene().update(8400, 33)
    assert.equal(harness.fx().rects.length, 0, '깜빡임')
    handle.sync({ ...harness.snapshot, highlight: 'bed', reducedMotion: true })
    harness.scene().update(8400, 33)
    assert.ok(harness.fx().rects.length > 0, '움직임 감소에서는 고정 표시')
    handle.sync({
      ...harness.snapshot,
      reaction: 1,
      feedback: { action: 'greet', stars: 0, xp: 8 },
    })
    harness.scene().update(9000, 33)
    harness.scene().update(9100, 33)
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe9778a),
      '인사 하트',
    )
    handle.destroy()
  } finally {
    global.Image = previousImage
  }
})

test('간식 낙하는 엔진이 origin에서 직접 계산하고 받음/빨간 공을 한 번만 연출한다', async () => {
  const previousImage = global.Image
  const previousPerformance = Object.getOwnPropertyDescriptor(globalThis, 'performance')
  let clock = 50_000
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: { now: () => clock },
  })
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    const session = {
      sessionId: 'snack-1',
      durationMs: 30_000,
      drops: [
        { kind: 'snack', lane: 1, landingAtMs: 2000 },
        { kind: 'hazard', lane: 1, landingAtMs: 3000 },
        { kind: 'snack', lane: 0, landingAtMs: 4000 },
      ],
    }
    const active = { session, elapsed: 0, origin: 50_000, lane: 1 }
    handle.sync({ ...harness.snapshot, snack: active })
    await new Promise(setImmediate)
    const drops = harness.objects.filter((item) => item.depth === 30)
    assert.equal(drops.length, 3)
    clock = 51_000
    harness.scene().update(1000, 33)
    assert.equal(drops[0].visible, true)
    const early = drops[0].y
    clock = 51_500
    harness.scene().update(1500, 33) // React 상태 변화 없이도 내려온다
    assert.ok(drops[0].y > early)
    assert.equal(harness.hero().x, snack.SNACK_LANE_X[1])
    clock = 52_010
    harness.scene().update(2010, 33)
    assert.equal(drops[0].visible, false, '받은 간식은 사라진다')
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe7ba4b),
      '받음 반짝임',
    )
    clock = 53_020
    harness.scene().update(3020, 33)
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xb3443c),
      '빨간 공 표시',
    )
    assert.notEqual(harness.hero().angle, 0)
    handle.sync({ ...harness.snapshot, snack: { ...active, lane: 2 } })
    clock = 54_050
    harness.scene().update(4050, 33)
    assert.equal(drops[2].visible, true, '놓친 간식은 바닥까지 떨어진다')
    clock = 54_600
    harness.scene().update(4600, 33)
    assert.equal(drops[2].visible, false)
    assert.equal(
      harness.fx().rects.some((rect) => rect.color === 0xe7ba4b || rect.color === 0xb3443c),
      false,
      '지난 연출은 다시 나오지 않는다',
    )
    clock = 999_999
    harness.scene().update(5000, 33)
    assert.ok(
      drops.every((drop) => !drop.visible),
      '30초 뒤에는 낙하물이 남지 않는다',
    )
    handle.destroy()
  } finally {
    global.Image = previousImage
    if (previousPerformance) Object.defineProperty(globalThis, 'performance', previousPerformance)
  }
})
