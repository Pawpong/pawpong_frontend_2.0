const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const axios = require('axios')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(file, deps = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('exports', 'require', code)(exports, (name) => {
    if (name === '@/shared/config/apiDiagnosticRoutes') {
      return load('src/shared/config/apiDiagnosticRoutes.ts')
    }
    if (!(name in deps)) throw new Error(`Missing dependency ${name}`)
    return deps[name]
  })
  return exports
}
const { ApiError, unwrap } = load('src/shared/api/unwrap.ts')
const { PetCommandQueue } = load('src/entities/playground-pet/model/commandQueue.ts')
const snack = load('src/entities/playground-pet/model/snack.ts')
const room = load('src/entities/playground-pet/model/room.ts')
const { PetCharacterResource, validatePetSheetPixels } = load(
  'src/features/playground-pet/lib/characterResource.ts',
)
const { petAsset, loadPetAssets } = load('src/features/playground-pet/lib/gameAssets.ts')

function sessionHarness() {
  const state = { token: 'fixture-owner-a', generation: 1, refreshes: 0, notifications: 0 }
  const token = { getAccessToken: () => state.token }
  const lifecycle = {
    getAuthSessionGeneration: () => state.generation,
    isAuthSessionCurrent: (generation) => state.generation === generation,
  }
  const recovery = {
    refreshAuthSession: async () => {
      state.refreshes++
      state.token = 'fixture-refreshed-owner-a'
      return state.token
    },
  }
  const { apiClient } = load('src/shared/api/client.ts', {
    axios,
    './unwrap': { ApiError },
    './token': token,
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/config/apiBaseUrl': { getApiBaseUrl: () => 'http://fixture.invalid' },
  })
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': { apiClient, API_VERSION: '/api/v2' },
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError, unwrap },
  })
  const auth = load('src/features/playground-pet/lib/usePetSession.ts', {
    react: {},
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/lib/authStateEvents': {
      AUTH_STATE_CHANGED: 'auth',
      notifyAuthStateChanged: () => state.notifications++,
    },
  })
  return {
    state,
    apiClient,
    api,
    auth,
    session: { token: state.token, generation: 1, scope: 'fixture-a' },
  }
}
const base = { expectedRevision: 7, idempotencyKey: 'fixture-key-0001' }
const sessionId = '367ae6c6-98a7-4f4b-b4be-6cb494c1e712'
const commands = [
  { kind: 'items/purchase', body: { ...base, itemId: 'toy_bone' } },
  { kind: 'room', body: { ...base, slot: 'toy', itemId: null } },
  { kind: 'games/start', body: { ...base, game: 'memory' } },
  { kind: 'games/cancel', body: { ...base, sessionId } },
  { kind: 'games/memory/flip', body: { ...base, sessionId, index: 3 } },
  {
    kind: 'games/snack/finish',
    body: {
      ...base,
      sessionId,
      inputs: [
        { tMs: 150, lane: 2 },
        { tMs: 500, lane: 1 },
      ],
    },
  },
]

test('all six v2 Axios endpoints bind the owner and send exact DTOs without score or rewards', async () => {
  const { apiClient, api } = sessionHarness()
  const observed = []
  const abort = new AbortController()
  apiClient.defaults.adapter = async (config) => {
    observed.push(config)
    return {
      status: 200,
      data: {
        success: true,
        data: { pet: { revision: 8 }, gameOutcome: { kind: 'equip', starsDelta: 0 } },
      },
      config,
      headers: {},
    }
  }
  for (const command of commands) await api.runPetCommand(command, abort.signal)
  for (let i = 0; i < commands.length; i++) {
    assert.equal(observed[i].url, `/api/v2/playground/pet/${commands[i].kind}`)
    assert.deepEqual(JSON.parse(observed[i].data), commands[i].body)
    assert.equal(observed[i].headers.Authorization, 'Bearer fixture-owner-a')
    assert.equal(observed[i].skipAuthRefresh, true)
    assert.equal(observed[i].signal, abort.signal)
    assert.equal('score' in JSON.parse(observed[i].data), false)
    assert.equal('stars' in JSON.parse(observed[i].data), false)
  }
})

test('current owner 401 recovers credentials once and never replays purchase/finish/flip', async () => {
  for (const command of [commands[0], commands[4], commands[5]]) {
    const { state, apiClient, api, auth, session } = sessionHarness()
    let calls = 0
    apiClient.defaults.adapter = async (config) => {
      calls++
      throw new axios.AxiosError('expired', 'ERR_BAD_REQUEST', config, null, {
        status: 401,
        data: { message: '인증이 필요합니다.' },
        config,
      })
    }
    await assert.rejects(
      auth.inPetSession(session, () => api.runPetCommand(command)),
      { status: 401 },
    )
    assert.equal(calls, 1)
    assert.equal(state.refreshes, 1)
    assert.equal(state.notifications, 1)
  }
})

test('late v2 writes and binary character replies are rejected after an account switch', async () => {
  for (const kind of ['finish', 'character']) {
    const { state, apiClient, api, auth, session } = sessionHarness()
    let resolve, ready
    const started = new Promise((done) => (ready = done))
    let observedOwner
    apiClient.defaults.adapter = (config) => {
      observedOwner = config.headers.Authorization
      ready()
      return new Promise((done) => {
        resolve = () =>
          done({
            status: 200,
            data:
              kind === 'character'
                ? new Blob(['png'], { type: 'image/png' })
                : { success: true, data: { pet: { revision: 8 } } },
            config,
            headers: {},
          })
      })
    }
    const pending = auth.inPetSession(session, () =>
      kind === 'character' ? api.getPetCharacter() : api.runPetCommand(commands[5]),
    )
    await started
    state.token = 'fixture-owner-b'
    state.generation++
    const rejected = assert.rejects(pending, { status: 401 })
    resolve()
    await rejected
    assert.equal(observedOwner, 'Bearer fixture-owner-a')
    assert.equal(state.refreshes, 0)
  }
})

test('owner character Axios request is binary, abortable and rejects invalid MIME or oversized data', async () => {
  const { apiClient, api } = sessionHarness()
  const abort = new AbortController()
  let payload = new Blob(['png'], { type: 'image/png' }),
    observed
  apiClient.defaults.adapter = async (config) => {
    observed = config
    return { status: 200, data: payload, config, headers: {} }
  }
  assert.equal(await api.getPetCharacter(abort.signal), payload)
  assert.equal(observed.url, '/api/v2/playground/pet/character')
  assert.equal(observed.responseType, 'blob')
  assert.equal(observed.headers.Accept, 'image/png')
  assert.equal(observed.signal, abort.signal)
  payload = new Blob(['html'], { type: 'text/html' })
  await assert.rejects(api.getPetCharacter(), { status: 503 })
  payload = new Blob([new Uint8Array(2_000_001)], { type: 'image/png' })
  await assert.rejects(api.getPetCharacter(), { status: 503 })
})

test('uncertain snack completion only repeats an identical captured input/key body on explicit retry', async () => {
  const seen = []
  const queue = new PetCommandQueue(async (command) => {
    seen.push(structuredClone(command))
    if (seen.length === 1) throw new ApiError('network disconnected')
    return { pet: { revision: 9 }, gameOutcome: { kind: 'finish', score: 8, starsDelta: 12 } }
  })
  const finish = structuredClone(commands[5])
  assert.equal((await queue.run(finish)).type, 'uncertain')
  assert.equal((await queue.run(commands[2])).type, 'busy')
  assert.equal(seen.length, 1)
  assert.equal((await queue.run()).data.gameOutcome.starsDelta, 12)
  assert.deepEqual(seen[0], seen[1])
})

test('queue disposal aborts the pending HTTP signal, blocks new writes and supports StrictMode reactivation', async () => {
  let signal,
    done,
    sends = 0
  const queue = new PetCommandQueue(async (_command, requestSignal) => {
    signal = requestSignal
    sends++
    return new Promise((resolve) => (done = resolve))
  })
  const pending = queue.run(commands[0])
  queue.dispose()
  assert.equal(signal.aborted, true)
  assert.equal((await queue.run(commands[1])).type, 'busy')
  done({ pet: { revision: 8 } })
  await pending
  assert.equal(sends, 1)
  queue.activate()
  const next = queue.run(commands[1])
  assert.equal(signal.aborted, false)
  done({ pet: { revision: 9 } })
  await next
})

test('snack movement has adjacent lanes, monotonic >=80ms inputs and hard bounds', () => {
  const recorder = new snack.SnackInputRecorder()
  assert.equal(recorder.move(-1, 0), true)
  assert.equal(recorder.lane, 0)
  assert.equal(recorder.move(-1, 100), false)
  assert.equal(recorder.move(1, 79), false)
  assert.equal(recorder.move(1, 80), true)
  assert.equal(recorder.move(1, 160), true)
  assert.equal(recorder.move(1, 240), false)
  for (const at of [-1, Infinity, NaN, 30001]) assert.equal(recorder.move(-1, at), false)
  const original = recorder.snapshot()
  original[0].lane = 2
  assert.equal(recorder.snapshot()[0].lane, 0)
  let time = 240
  while (recorder.snapshot().length < 180) {
    recorder.move(recorder.lane === 2 ? -1 : 1, time)
    time += 80
  }
  assert.equal(recorder.move(-1, time), false)
  const inputs = recorder.snapshot()
  let lane = 1
  inputs.forEach((input, index) => {
    assert.equal(Math.abs(input.lane - lane), 1)
    if (index) assert.ok(input.tMs - inputs[index - 1].tMs >= 80)
    lane = input.lane
  })
})

test('snack preview replays landing boundary inputs and hazards with score floor zero', () => {
  const challenge = {
    drops: [
      { lane: 1, kind: 'hazard', landingAtMs: 2000 },
      { lane: 0, kind: 'snack', landingAtMs: 3000 },
      { lane: 2, kind: 'snack', landingAtMs: 4000 },
      { lane: 1, kind: 'snack', landingAtMs: 5000 },
      { lane: 1, kind: 'hazard', landingAtMs: 6000 },
    ],
  }
  const inputs = [
    { tMs: 3000, lane: 0 },
    { tMs: 4500, lane: 1 },
  ]
  assert.deepEqual(snack.previewSnack(challenge, inputs, 6000), {
    score: 0,
    catches: 2,
    hazards: 2,
    misses: 1,
  })
  assert.deepEqual(snack.previewSnack(challenge, inputs, 2999), {
    score: 0,
    catches: 0,
    hazards: 1,
    misses: 0,
  })
  const drops = Array.from({ length: 28 }, (_, index) => ({
    lane: 1,
    kind: (index + 1) % 6 === 0 ? 'hazard' : 'snack',
    landingAtMs: 2000 + index * 1000,
  }))
  assert.equal(snack.previewSnack({ drops }, [], 30000).catches, 24)
})

test('room preview changes one slot while inventory/wallet and saved room stay untouched', () => {
  const item = { id: 'bed_moon', slot: 'bed', minLevel: 4, price: 90 }
  const game = {
    room: {
      wallpaper: 'wallpaper_cream',
      floor: 'floor_oak',
      bed: 'bed_cushion',
      toy: 'toy_ball',
      plant: 'plant_sprout',
      decoration: 'decoration_paw',
    },
    inventory: ['bed_cushion'],
    wallet: { stars: 50 },
  }
  const preview = room.previewPetRoom(game.room, item)
  assert.equal(preview.bed, 'bed_moon')
  assert.equal(game.room.bed, 'bed_cushion')
  assert.equal(game.wallet.stars, 50)
  assert.deepEqual(room.itemAvailability(game, item, 1), {
    owned: false,
    equipped: false,
    locked: true,
    affordable: false,
    purchasable: false,
  })
  assert.equal(room.itemAvailability({ ...game, wallet: { stars: 90 } }, item, 4).purchasable, true)
  assert.equal(
    room.itemAvailability({ ...game, inventory: [...game.inventory, item.id] }, item, 4)
      .purchasable,
    false,
  )
  assert.equal(room.previewPetRoom(game.room, null), game.room)
})

test('owner sheet disposal revokes one URL, aborts requests and discards late private bytes', async () => {
  const created = [],
    revoked = []
  const resource = new PetCharacterResource({
    createObjectURL: () => {
      const url = `blob:fixture-${created.length}`
      created.push(url)
      return url
    },
    revokeObjectURL: (url) => revoked.push(url),
  })
  let signal
  assert.equal(
    await resource.load(
      async (s) => {
        signal = s
        return new Blob(['png'])
      },
      async () => {},
    ),
    'blob:fixture-0',
  )
  resource.dispose()
  resource.dispose()
  assert.equal(signal.aborted, true)
  assert.deepEqual(revoked, ['blob:fixture-0'])
  let resolve
  const delayed = resource.load(
    () => new Promise((done) => (resolve = done)),
    async () => {},
  )
  resource.dispose()
  resolve(new Blob(['late']))
  assert.equal(await delayed, null)
  assert.equal(created.length, 1)
})

test('failed sprite validation revokes its Blob and a later retry can create a valid sheet', async () => {
  const revoked = []
  let index = 0
  const resource = new PetCharacterResource({
    createObjectURL: () => `blob:fixture-${index++}`,
    revokeObjectURL: (url) => revoked.push(url),
  })
  await assert.rejects(
    resource.load(
      async () => new Blob(['png']),
      async () => {
        throw new Error('wrong dimensions')
      },
    ),
    /wrong dimensions/,
  )
  assert.deepEqual(revoked, ['blob:fixture-0'])
  assert.equal(
    await resource.load(
      async () => new Blob(['png']),
      async () => {},
    ),
    'blob:fixture-1',
  )
  resource.dispose()
  assert.deepEqual(revoked, ['blob:fixture-0', 'blob:fixture-1'])
})

test('same-size sheets with opaque wallpaper, partial alpha, broken grid or empty frames are rejected', () => {
  const valid = new Uint8ClampedArray(576 * 96 * 4)
  for (let frame = 0; frame < 6; frame++)
    for (let y = 40; y < 84; y++)
      for (let x = frame * 96 + 20; x < frame * 96 + 76; x++)
        valid.set([240, 220, 180, 255], (y * 576 + x) * 4)
  validatePetSheetPixels(valid)
  const opaque = valid.slice()
  for (let i = 3; i < opaque.length; i += 4) opaque[i] = 255
  assert.throws(() => validatePetSheetPixels(opaque), /전신/)
  const partial = valid.slice()
  partial[(40 * 576 + 20) * 4 + 3] = 128
  assert.throws(() => validatePetSheetPixels(partial), /투명/)
  const blurry = valid.slice()
  blurry[(40 * 576 + 21) * 4] = 239
  assert.throws(() => validatePetSheetPixels(blurry), /격자/)
  assert.throws(() => validatePetSheetPixels(new Uint8ClampedArray(valid.length)), /프레임/)
})

test('asset resolver refuses external or traversal URLs; manifest must cover all24 at320x224', async () => {
  const descriptor = {
    url: '/playground/pet/v2/toy_bone.png',
    width: 64,
    height: 64,
    logicalWidth: 24,
    logicalHeight: 24,
  }
  assert.equal(petAsset({ assets: { toy_bone: descriptor } }, 'toy_bone'), descriptor)
  assert.equal(
    petAsset({ assets: { bad: { ...descriptor, url: 'https://external.test/image' } } }, 'bad'),
    null,
  )
  assert.equal(
    petAsset({ assets: { bad: { ...descriptor, url: '/playground/pet/v2/../secret' } } }, 'bad'),
    null,
  )
  assert.equal(petAsset({ assets: {} }, 'unknown'), null)
  const previousFetch = global.fetch
  try {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        world: { width: 320, height: 224, wallHeight: 128 },
        assets: { toy_bone: descriptor },
      }),
    })
    await assert.rejects(loadPetAssets(new AbortController().signal), /목록/)
  } finally {
    global.fetch = previousFetch
  }
})

test('memory DOM exposes only revealed symbols, keeps eight keyboard buttons and locks mismatches', () => {
  const jsx = require('react/jsx-runtime')
  const { PetGlyph } = load('src/features/playground-pet/ui/PetGlyph.tsx', {
    'react/jsx-runtime': jsx,
  })
  const { PetMemoryBoard } = load('src/features/playground-pet/ui/PetMiniGames.tsx', {
    react: React,
    'react-dom': { createPortal() {} },
    'react/jsx-runtime': jsx,
    '@/entities/playground-pet/model/snack': snack,
    '../lib/useServerClock': { petRequestKey() {} },
    './PetGlyph': { PetGlyph },
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
  })
  const session = {
    sessionId,
    game: 'memory',
    status: 'active',
    revealed: [{ index: 0, symbol: 'paw' }],
    matchedIndices: [],
    lockUntil: null,
  }
  const markup = renderToStaticMarkup(
    React.createElement(PetMemoryBoard, { session, now: 0, disabled: false, onFlip() {} }),
  )
  assert.equal((markup.match(/<button/g) || []).length, 8)
  assert.equal((markup.match(/disabled=/g) || []).length, 1)
  assert.ok(markup.includes('1번 카드, 발바닥'))
  assert.ok(markup.includes('2번 카드, 뒤집기'))
  assert.equal(markup.includes('하트'), false)
  assert.equal(markup.includes('뼈다귀'), false)
  const locked = renderToStaticMarkup(
    React.createElement(PetMemoryBoard, {
      session: { ...session, lockUntil: '2026-10-05T00:00:00Z' },
      now: 0,
      disabled: false,
      onFlip() {},
    }),
  )
  assert.equal((locked.match(/disabled=/g) || []).length, 8)
})

function roomUiHarness() {
  const slots = []
  let cursor = 0
  const hooks = {
    useEffect() {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [
        slots[index],
        (value) => (slots[index] = typeof value === 'function' ? value(slots[index]) : value),
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
  }
  const Stage = () => null,
    Games = () => null,
    Adoption = () => null
  let characterEnabled, characterSource
  const presentation = load('src/entities/playground-pet/model/presentation.ts')
  const { PetRoom } = load('src/features/playground-pet/ui/PetRoom.tsx', {
    react: hooks,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/entities/playground-pet': presentation,
    '@/entities/playground-pet/model/room': room,
    '../lib/useServerClock': { useServerClock: (iso) => Date.parse(iso) },
    '../lib/usePetCharacter': {
      usePetCharacter: (_session, _pet, _source, enabled) => {
        characterEnabled = enabled
        characterSource = _source
        return { url: 'blob:owner-sheet', error: null }
      },
    },
    '../lib/usePetAssets': { usePetAssets: () => ({ manifest: { assets: {} }, error: null }) },
    '../lib/usePetSound': { usePetSound: () => ({ play() {}, toggle() {}, enabled: false }) },
    './PetImage': { PetImage: () => null },
    './PetAdoption': { PetAdoption: Adoption },
    './PetStage': { PetStage: Stage },
    './PetDecorations': { PetDecorations: () => null },
    './PetMiniGames': { PetMiniGames: Games },
    './PetGlyph': { PetGlyph: () => null },
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
  })
  function nodes(node) {
    if (!node || typeof node !== 'object') return []
    if (Array.isArray(node)) return node.flatMap(nodes)
    return [node, ...nodes(node.props?.children)]
  }
  const view = {
    pet: {
      id: 'owner-pet',
      sourceJobId: 'owner-source',
      imageUrl: '/owner.png',
      character: { format: 'pet-sprite-v1', sourceJobId: 'owner-source' },
      name: '도토리',
      level: 1,
      totalXp: 0,
      xpForCurrentLevel: 0,
      xpForNextLevel: 20,
      stats: { fullness: 80, mood: 80, energy: 100, affinity: 0 },
      restEndsAt: null,
      revision: 7,
    },
    game: null,
    daily: { xp: 0, maxXp: 60, quests: [] },
    week: { daysTogether: 1 },
    actions: {},
    records: [],
    unlocks: [],
    serverTime: '2026-10-05T00:00:00Z',
  }
  function render(nextView = view, gameOutcome = null, initialCharacterSourceId) {
    cursor = 0
    return nodes(
      PetRoom({
        view: nextView,
        session: { scope: 'a' },
        disabled: false,
        reaction: 0,
        gameOutcome,
        feedback: { action: null, stars: 0, xp: 0 },
        operation: { busy: false, uncertain: false, notice: '', onRetry() {} },
        onAction() {},
        onRefresh() {},
        onCommand() {},
        initialCharacterSourceId,
      }),
    )
  }
  return {
    render,
    view,
    Stage,
    Games,
    Adoption,
    characterEnabled: () => characterEnabled,
    characterSource: () => characterSource,
  }
}

test('an existing full-body pet can explicitly connect a new result link and then loads its new sheet source', () => {
  const ui = roomUiHarness()
  const view = {
    ...ui.view,
    game: {
      room: {},
      catalog: [],
      achievements: [],
      wallet: { stars: 50 },
      games: { active: null },
    },
  }
  assert.equal(
    ui.render(view).some((node) => node.type === ui.Adoption),
    false,
  )
  const proposed = ui.render(view, null, 'new-owned-source')
  const selection = proposed.find((node) => node.type === ui.Adoption)
  assert.equal(selection.props.initialSourceJobId, 'new-owned-source')
  assert.equal(selection.props.connectRevision, 7)
  assert.equal(ui.characterSource(), 'owner-source')
  const connected = {
    ...view,
    pet: { ...view.pet, character: { format: 'pet-sprite-v1', sourceJobId: 'new-owned-source' } },
  }
  assert.equal(
    ui.render(connected, null, 'new-owned-source').some((node) => node.type === ui.Adoption),
    false,
  )
  assert.equal(ui.characterSource(), 'new-owned-source')
})

test('a candidate link never submits an ineligible or other-owner source and valid connection is explicit', () => {
  const calls = []
  const noop = () => null
  const { PetAdoption } = load('src/features/playground-pet/ui/PetAdoption.tsx', {
    react: { useState: (initial) => [initial, () => {}] },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: noop },
    '@tanstack/react-query': {
      useInfiniteQuery: () => ({
        data: { pages: [{ images: [{ sourceJobId: 'owned-source', imageUrl: '/owned.png' }] }] },
      }),
    },
    '@/entities/playground-pet': {
      ...load('src/entities/playground-pet/model/presentation.ts'),
      getEligiblePetImages: async () => ({ images: [] }),
    },
    '@/shared/ui/Button': { Button: noop, buttonVariants: () => '' },
    '@/shared/ui/Input': { Input: noop },
    '@/shared/assets': { PawPrintIcon: noop, PixelCheckIcon: noop },
    '../lib/usePetSession': { inPetSession: (_session, read) => read() },
    '../lib/usePetController': { petPrivateKey: () => [] },
    '../lib/useServerClock': { petRequestKey: () => 'explicit-command-key' },
    './PetImage': { PetImage: noop },
  })
  for (const candidate of ['bad-id', 'other-owner-source', 'owned-source']) {
    const tree = PetAdoption({
      session: {},
      initialSourceJobId: candidate,
      connectRevision: 7,
      disabled: false,
      onAdopt: (command) => calls.push(command),
    })
    assert.equal(calls.length, 0) // Displaying a result link never performs a mutation.
    elementNodes(tree)
      .find((node) => node.type === 'form')
      .props.onSubmit({ preventDefault() {} })
    assert.equal(calls.length, candidate === 'owned-source' ? 1 : 0)
  }
  assert.deepEqual(calls[0], {
    kind: 'character-source',
    body: {
      sourceJobId: 'owned-source',
      expectedRevision: 7,
      idempotencyKey: 'explicit-command-key',
    },
  })
})

test('care-only API view keeps care/records and skips unavailable tabs in keyboard navigation', () => {
  const ui = roomUiHarness()
  let nodes = ui.render()
  assert.deepEqual(
    nodes.filter((n) => n.props?.role === 'tab').map((n) => n.props.children),
    ['내 방', '기록'],
  )
  assert.equal(ui.characterEnabled(), false)
  assert.equal(
    nodes.some((n) => n.type === ui.Stage),
    false,
  )
  let focused = -1,
    prevented = false
  nodes
    .find((n) => n.props?.role === 'tablist')
    .props.onKeyDown({
      key: 'ArrowRight',
      preventDefault() {
        prevented = true
      },
      currentTarget: {
        querySelectorAll: () => [0, 1].map((index) => ({ focus: () => (focused = index) })),
      },
    })
  nodes = ui.render()
  assert.equal(nodes.find((n) => n.props?.['aria-selected']).props.children, '기록')
  assert.equal(focused, 1)
  assert.equal(prevented, true)
})

test('restored game stays on its results tab and starts require actual engine readiness', () => {
  const ui = roomUiHarness()
  const game = {
    wallet: { stars: 50 },
    room: {},
    catalog: [],
    achievements: [],
    games: { active: { sessionId, game: 'memory' } },
  }
  let nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.props?.id === 'pet-panel-games').props.hidden, false)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
  nodes.find((n) => n.type === ui.Stage).props.onReady(true)
  nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, true)
  const result = { kind: 'finish', sessionId, score: 100, starsDelta: 14 }
  nodes = ui.render({ ...ui.view, game: { ...game, games: { active: null } } }, result)
  assert.equal(nodes.find((n) => n.props?.id === 'pet-panel-games').props.hidden, false)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.gameOutcome, result)
  nodes.find((n) => n.type === ui.Stage).props.onReady(false)
  nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
})

test('legacy portraits never load into the room or unlock games; explicit connection preserves care', () => {
  const ui = roomUiHarness()
  const view = {
    ...ui.view,
    pet: { ...ui.view.pet, character: { format: 'legacy-portrait', sourceJobId: 'original' } },
    game: {
      wallet: { stars: 50 },
      room: {},
      catalog: [],
      achievements: [],
      games: { active: null },
    },
  }
  let nodes = ui.render(view)
  assert.equal(ui.characterEnabled(), false)
  assert.equal(nodes.find((n) => n.type === ui.Stage).props.snapshot.characterUrl, null)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
  assert.ok(nodes.some((n) => n.props?.connectRevision === 7))
  assert.ok(nodes.some((n) => n.props?.['aria-label']?.startsWith('인사하기')))
  nodes.find((n) => n.type === ui.Stage).props.onReady(true)
  nodes = ui.render(view)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
})

function effectHarness() {
  const slots = [],
    effects = [],
    cleanups = []
  let cursor = 0,
    pending = []
  const react = {
    useMemo: (fn) => fn(),
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [
        slots[index],
        (value) => (slots[index] = typeof value === 'function' ? value(slots[index]) : value),
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useEffect(fn, dependencies) {
      const index = cursor++
      if (
        !effects[index] ||
        dependencies.some((value, i) => !Object.is(value, effects[index][i]))
      ) {
        effects[index] = dependencies
        pending.push(() => {
          cleanups[index]?.()
          cleanups[index] = fn()
        })
      }
    },
  }
  return {
    react,
    render(fn) {
      cursor = 0
      pending = []
      return fn()
    },
    flush() {
      pending.forEach((fn) => fn())
      pending = []
    },
    unmount() {
      cleanups.forEach((fn) => fn?.())
    },
  }
}
function elementNodes(node) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(elementNodes)
  return [node, ...elementNodes(node.props?.children)]
}

test('failed dynamic engine import retries, immutable sync preserves one game and unmount destroys it', async () => {
  const runtime = effectHarness(),
    readiness = [],
    syncs = []
  let importAttempts = 0,
    creations = 0,
    destructions = 0,
    engineState
  const dependencies = {
    react: runtime.react,
    'react/jsx-runtime': require('react/jsx-runtime'),
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
  }
  Object.defineProperty(dependencies, '../lib/petGameEngine', {
    get() {
      if (++importAttempts === 1) throw new Error('chunk download failed')
      return {
        createPetGame(_host, _snapshot, onState) {
          creations++
          engineState = onState
          onState('loading')
          return { sync: (value) => syncs.push(value), retry() {}, destroy: () => destructions++ }
        },
      }
    },
  })
  const { PetStage } = load('src/features/playground-pet/ui/PetStage.tsx', dependencies)
  const onReady = (value) => readiness.push(value)
  let snapshot = { characterUrl: 'blob:owner', room: {} }
  function render() {
    const nodes = elementNodes(
      runtime.render(() => PetStage({ snapshot, name: '도토리', onReady })),
    )
    nodes.find((n) => n.props?.className === 'canvasHost').props.ref.current = {}
    runtime.flush()
    return nodes
  }
  render()
  await new Promise(setImmediate)
  const failed = render()
  assert.equal(readiness.at(-1), false)
  failed.find((n) => n.type === 'button').props.onClick()
  render()
  await new Promise(setImmediate)
  assert.equal(importAttempts, 2)
  assert.equal(creations, 1)
  assert.equal(readiness.at(-1), false)
  engineState('ready')
  assert.equal(readiness.at(-1), true)
  snapshot = { ...snapshot, room: { toy: null } }
  render()
  assert.equal(syncs.at(-1), snapshot)
  assert.equal(creations, 1)
  runtime.unmount()
  assert.equal(destructions, 1)
  engineState('ready')
  assert.equal(readiness.length, 3)
})

test('personal sheet cannot remain visible when its pet/source or account scope changes', async () => {
  const runtime = effectHarness()
  let serial = 0,
    disposed = 0
  class Resource {
    async load() {
      return `blob:owner-${++serial}`
    }
    dispose() {
      disposed++
    }
  }
  const { usePetCharacter } = load('src/features/playground-pet/lib/usePetCharacter.ts', {
    react: runtime.react,
    '@/entities/playground-pet': { getPetCharacter() {} },
    './characterResource': { PetCharacterResource: Resource, validatePetSheet() {} },
    './usePetSession': { inPetSession: (_session, fn) => fn() },
  })
  let session = { scope: 'owner-a' },
    source = 'source-a'
  const render = () => runtime.render(() => usePetCharacter(session, 'pet-id', source))
  assert.equal(render().url, null)
  runtime.flush()
  await new Promise(setImmediate)
  assert.equal(render().url, 'blob:owner-1')
  source = 'source-b'
  assert.equal(render().url, null)
  runtime.flush()
  await new Promise(setImmediate)
  assert.equal(render().url, 'blob:owner-2')
  session = { scope: 'owner-b' }
  assert.equal(render().url, null)
  runtime.flush()
  await new Promise(setImmediate)
  assert.equal(render().url, 'blob:owner-3')
  runtime.unmount()
  assert.equal(disposed, 3)
})

test('room engine preserves its game, honours reduced motion and flushes destruction with a paused loop', async () => {
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
      if (!value.includes('slow-unselected'))
        queueMicrotask(() => (value.includes('unavailable') ? this.onerror?.() : this.onload?.()))
    }
  }
  try {
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
    })
    let snapshot = {
      manifest: {
        assets: {
          wallpaper_cream: { url: '/playground/pet/v2/wallpaper_cream.png' },
          floor_oak: { url: '/playground/pet/v2/floor_oak.png' },
          toy_bone: { url: '/playground/pet/v2/slow-unselected.png' },
          toy_ball: { url: '/playground/pet/v2/unavailable.png' },
        },
      },
      room: { wallpaper: 'wallpaper_cream', floor: 'floor_oak' },
      characterUrl: 'blob:own-six-frame-sheet',
      resting: false,
      reaction: 0,
      feedback: { action: null, stars: 0, xp: 0 },
      reducedMotion: false,
      snack: null,
    }
    const states = []
    const handle = createPetGame({}, snapshot, (state) => states.push(state))
    await new Promise(setImmediate)
    assert.equal(states.at(-1), 'ready')
    const hero = objects.find((item) => item.kind === 'sprite'),
      sparks = objects.filter((item) => item.kind === 'graphics').at(-1)
    assert.ok(objects.find((item) => item.kind === 'graphics').sparkRects >= 10)
    instance.scene.update(650)
    assert.equal(hero.frame, 1)
    snapshot = { ...snapshot, reducedMotion: true }
    handle.sync(snapshot)
    instance.scene.update(1950)
    assert.equal(hero.frame, 0)
    snapshot = { ...snapshot, reaction: 1, feedback: { action: 'greet', stars: 6, xp: 4 } }
    handle.sync(snapshot)
    instance.scene.update(2000)
    assert.equal(hero.frame, 2)
    assert.equal(sparks.sparkRects, 0)
    handle.sync({ ...snapshot, resting: true })
    instance.scene.update(2050)
    assert.equal(hero.frame, 5)
    assert.equal(instances, 1)
    handle.destroy()
    handle.destroy()
    assert.equal(destroyed, 1)
    assert.equal(instance.pendingDestroy, false)
    const equippedStates = []
    const equipped = createPetGame({}, snapshot, (state) => equippedStates.push(state))
    await new Promise(setImmediate)
    assert.equal(equippedStates.at(-1), 'ready')
    equipped.sync({ ...snapshot, room: { ...snapshot.room, toy: 'toy_ball' } })
    await new Promise(setImmediate)
    assert.equal(equippedStates.at(-1), 'error')
    equipped.destroy()
    const booting = createPetGame({ awaitBoot: true }, snapshot, () => {})
    booting.destroy()
    assert.equal(destroyed, 2)
    instance.onReady()
    instance.isRunning = true
    await new Promise(setImmediate)
    assert.equal(destroyed, 3)
    assert.equal(instance.pendingDestroy, false)
    const failures = []
    const failed = createPetGame(
      {},
      {
        ...snapshot,
        characterUrl: null,
        manifest: {
          assets: {
            wallpaper_cream: { url: '/playground/pet/v2/unavailable.png' },
            floor_oak: { url: '/playground/pet/v2/floor_oak.png' },
          },
        },
      },
      (state) => failures.push(state),
    )
    await new Promise(setImmediate)
    assert.equal(failures.at(-1), 'error')
    assert.equal(objects.filter((item) => item.kind === 'tileSprite').at(-1).visible, true)
    assert.equal(objects.filter((item) => item.kind === 'sprite').at(-1).visible, false)
    assert.ok(objects.filter((item) => item.kind === 'graphics').at(-2).sparkRects >= 10)
    failed.destroy()
  } finally {
    global.Image = previousImage
  }
})

test('failed snack assets retry to real textures in the same session and preparation loads only chosen game assets', async () => {
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

test('expired sessions offer refresh/cancel and restored snack never invents a finish replay', () => {
  const jsx = require('react/jsx-runtime')
  const { PetGlyph } = load('src/features/playground-pet/ui/PetGlyph.tsx', {
    'react/jsx-runtime': jsx,
  })
  const { PetMiniGames } = load('src/features/playground-pet/ui/PetMiniGames.tsx', {
    react: React,
    'react-dom': {
      createPortal() {
        throw new Error('No game surface in this render')
      },
    },
    'react/jsx-runtime': jsx,
    '@/entities/playground-pet/model/snack': snack,
    '../lib/useServerClock': { petRequestKey() {} },
    './PetGlyph': { PetGlyph },
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
  })
  const props = {
    game: {
      wallet: { stars: 50, dailyEarned: 0, dailyLimit: 90 },
      games: {
        rewardedToday: 0,
        dailyRewardLimit: 3,
        bestScores: { memory: 0, snack: 0 },
        active: {
          sessionId,
          game: 'memory',
          status: 'active',
          expiresAt: '2026-10-05T00:00:00Z',
          rewardEligible: true,
        },
      },
    },
    gameOutcome: null,
    revision: 7,
    serverTime: '2026-10-05T00:01:00Z',
    now: Date.parse('2026-10-05T00:01:00Z'),
    disabled: false,
    characterReady: true,
    onPrepareGame: async () => true,
    gameSurface: null,
    onCommand() {
      throw new Error('A render must never send a mutation')
    },
    onRefresh() {},
    onSnack() {},
  }
  const expired = renderToStaticMarkup(React.createElement(PetMiniGames, props))
  assert.ok(expired.includes('게임 시간이 만료됐어요'))
  assert.ok(expired.includes('최신 상태 확인'))
  assert.equal(expired.includes('1번 카드'), false)
  const restored = renderToStaticMarkup(
    React.createElement(PetMiniGames, {
      ...props,
      game: {
        ...props.game,
        games: {
          ...props.game.games,
          active: { ...props.game.games.active, game: 'snack', expiresAt: '2026-10-05T00:04:00Z' },
        },
      },
    }),
  )
  assert.ok(restored.includes('이 판의 이동 기록이 이 화면에 없어요'))
  assert.ok(restored.includes('이 판 종료'))
  assert.equal(restored.includes('결과 저장하고 별사탕 확인'), false)
})

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

test('snack start waits for successful preparation, blocks duplicate clicks and never posts after failure or hidden preparation', async () => {
  const h = snackUiHarness(),
    requests = []
  let prepared,
    preparations = 0
  h.props.onPrepareGame = (kind) => {
    assert.equal(kind, 'snack')
    preparations++
    return new Promise((resolve) => {
      prepared = resolve
    })
  }
  h.props.onCommand = async (command) => {
    requests.push(command)
    return { type: 'busy' }
  }
  const startButton = () => h.render().find((n) => n.props.children === '간식 받기 시작')
  try {
    const first = startButton()
    first.props.onClick()
    first.props.onClick()
    assert.equal(preparations, 1)
    assert.equal(requests.length, 0)
    assert.equal(startButton().props.disabled, true)
    prepared(false)
    await new Promise(setImmediate)
    assert.equal(requests.length, 0)
    startButton().props.onClick()
    prepared(true)
    await new Promise(setImmediate)
    assert.equal(requests.length, 1)
    assert.equal(requests[0].kind, 'games/start')
    assert.equal(requests[0].body.game, 'snack')
    startButton().props.onClick()
    h.visibility(true)
    h.visibility(false)
    prepared(true)
    await new Promise(setImmediate)
    assert.equal(requests.length, 1)
  } finally {
    h.dispose()
  }
})

test('rejected explicit finish retry unlocks a fresh revision without replaying inputs automatically', async () => {
  const h = snackUiHarness(),
    requests = []
  let finishes = 0
  try {
    const queue = new PetCommandQueue(async (command) => {
      requests.push(structuredClone(command))
      if (command.kind === 'games/start') {
        h.activate()
        return {
          game: h.props.game,
          serverTime: h.props.serverTime,
          gameOutcome: { kind: 'start' },
        }
      }
      if (++finishes === 1) throw new ApiError('response lost')
      if (finishes === 2) throw new ApiError('REVISION_CONFLICT', 409)
      h.props.game = { ...h.props.game, games: { ...h.props.game.games, active: null } }
      return {
        game: h.props.game,
        gameOutcome: { kind: 'finish', sessionId, game: 'snack', score: 8, starsDelta: 12 },
      }
    })
    h.props.onCommand = (command) => queue.run(command)
    h.render()
      .find((n) => n.type === 'button' && n.props.children === '간식 받기 시작')
      .props.onClick()
    await new Promise(setImmediate)
    h.render()
    h.tick(30000)
    const finish = h
      .render()
      .find((n) => n.type === 'button' && n.props.children === '결과 저장하고 별사탕 확인')
    finish.props.onClick()
    finish.props.onClick()
    await new Promise(setImmediate)
    assert.equal(finishes, 1)
    h.props.disabled = true
    assert.equal(
      h.render().find((n) => n.props.children === '결과 저장하고 별사탕 확인').props.disabled,
      true,
    )
    assert.equal((await h.props.onCommand()).type, 'rejected')
    assert.deepEqual(requests[1], requests[2])
    h.props.disabled = false
    h.props.revision = 9
    const fresh = h.render().find((n) => n.props.children === '결과 저장하고 별사탕 확인')
    assert.equal(fresh.props.disabled, false)
    assert.equal(finishes, 2)
    fresh.props.onClick()
    await new Promise(setImmediate)
    assert.equal(finishes, 3)
    assert.equal(requests[3].body.expectedRevision, 9)
    assert.notEqual(requests[3].body.idempotencyKey, requests[1].body.idempotencyKey)
    assert.deepEqual(requests[3].body.inputs, requests[1].body.inputs)
    h.render()
    assert.equal(h.timers.size, 0)
  } finally {
    h.dispose()
  }
})

test('visibility during a pending game start survives late completion and cleans timers/listeners', async () => {
  for (const publishEarly of [true, false]) {
    const h = snackUiHarness()
    try {
      let complete
      h.props.onCommand = () => {
        if (publishEarly) h.activate()
        return new Promise(
          (resolve) =>
            (complete = () => {
              h.activate()
              resolve({
                type: 'success',
                data: {
                  game: h.props.game,
                  serverTime: h.props.serverTime,
                  gameOutcome: { kind: 'start' },
                },
              })
            }),
        )
      }
      h.render()
        .find((n) => n.props.children === '간식 받기 시작')
        .props.onClick()
      await new Promise(setImmediate)
      h.render()
      h.visibility(true)
      h.visibility(false)
      complete()
      await new Promise(setImmediate)
      const nodes = h.render()
      assert.ok(
        nodes.some(
          (n) =>
            n.props?.role === 'alert' &&
            String(n.props.children).includes('화면이 숨겨져 게임을 멈췄어요.'),
        ),
      )
      assert.equal(
        nodes.some((n) => n.props?.className === 'snackReadout'),
        false,
      )
      assert.equal(h.timers.size, 0)
      assert.equal(h.snapshots.at(-1), null)
    } finally {
      h.dispose()
      assert.equal(
        [...h.listeners.values()].reduce((sum, set) => sum + set.size, 0),
        0,
      )
    }
  }
})
