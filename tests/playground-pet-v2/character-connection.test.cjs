const { test, assert, ts, load, room } = require('./fixtures/core.fixture.cjs')
const { elementNodes } = require('./fixtures/effects.fixture.cjs')
const { roomUiHarness } = require('./fixtures/room.fixture.cjs')

test('기존 캐릭터는 새 결과 링크를 직접 연결한 뒤 새 그림을 불러옴', () => {
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

test('후보 링크는 부적격 또는 다른 계정의 그림을 전송하지 않고 직접 연결을 요구함', () => {
  const calls = []
  const noop = () => null
  const { PetAdoption } = load('src/features/playground-pet/ui/PetAdoption.tsx', {
    react: {
      useState: (initial) => [initial, () => {}],
      useRef: (current) => ({ current }),
      useEffect() {},
    },
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
    assert.equal(calls.length, 0) // 결과 링크를 보여주는 것만으로 변경 요청을 보내지 않는다.
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
