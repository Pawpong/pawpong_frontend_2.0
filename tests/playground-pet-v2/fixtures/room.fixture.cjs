const { load, room } = require('./core.fixture.cjs')

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
  const presentation = {
    ...load('src/entities/playground-pet/model/presentation.ts'),
    ...load('src/entities/playground-pet/model/mood.ts'),
    ...load('src/entities/playground-pet/model/navigation.ts'),
  }
  let selectedTab = 'room'
  const { PetRoom } = load('src/features/playground-pet/ui/PetRoom.tsx', {
    react: hooks,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/entities/playground-pet': presentation,
    '@/entities/playground-pet/model/room': room,
    '@/entities/playground-pet/model/shop': load('src/entities/playground-pet/model/shop.ts', {
      './room': room,
    }),
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
    '../lib/usePetDeviceViewport': { usePetDeviceViewport: () => ({ current: null }) },
    '../lib/usePetNavigation': {
      usePetNavigation: (active) => {
        if (active) selectedTab = 'games'
        return {
          tab: selectedTab,
          selectTab: (tab) => {
            selectedTab = tab
          },
          clearSource() {},
        }
      },
    },
    './PetImage': { PetImage: () => null },
    './PetAdoption': { PetAdoption: Adoption },
    './PetStage': { PetStage: Stage },
    './PetDecorations': { PetDecorations: () => null },
    './PetMiniGames': { PetMiniGames: Games },
    './PetGlyph': { PetGlyph: () => null },
    './PetRoomSummary': { PetRoomSummary: () => null },
    './PetRecords': { PetRecords: () => null },
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

module.exports = { roomUiHarness }
