const {
  test,
  assert,
  ts,
  load,
  room,
  PetCharacterResource,
} = require('./fixtures/core.fixture.cjs')
const { effectHarness, elementNodes } = require('./fixtures/effects.fixture.cjs')

test('엔진 가져오기는 재시도하고 상태 갱신은 인스턴스를 유지하며 종료 시 정리함', async () => {
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
    '@/entities/playground-pet/model/room': room,
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

test('반려동물과 그림 또는 계정이 바뀌면 이전 개인 그림을 숨김', async () => {
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
