const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const jsx = require('react/jsx-runtime')
const { hooks, nodes } = require('../../fixtures/react-hooks.fixture.cjs')

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
    if (!(name in deps)) throw new Error(`등록하지 않은 테스트 의존성: ${name}`)
    return deps[name]
  })
  return exports
}
const room = load('src/entities/playground-pet/model/room.ts')
const shop = load('src/entities/playground-pet/model/shop.ts', { './room': room })
const constants = load('src/features/playground-pet/constants/pet-shop.ts')
const css = { default: new Proxy({}, { get: (_, key) => String(key) }) }

function gameFixture() {
  const catalog = [
    ['wallpaper_cream', '크림 벽지', 'wallpaper', 0, 1, 'cozy'],
    ['floor_oak', '참나무 바닥', 'floor', 0, 1, 'cozy'],
    ['bed_cushion', '폭신한 쿠션', 'bed', 0, 1, 'cozy'],
    ['toy_ball', '통통 공', 'toy', 0, 1, 'cozy'],
    ['plant_sprout', '작은 새싹', 'plant', 0, 1, 'cozy'],
    ['decoration_paw', '발바닥 액자', 'decoration', 0, 1, 'cozy'],
    ['toy_bone', '뼈다귀 장난감', 'toy', 8, 1, 'forest'],
    ['plant_flower', '들꽃 화분', 'plant', 12, 1, 'forest'],
    ['bed_moon', '초승달 침대', 'bed', 90, 4, 'starry'],
    ['wallpaper_cloud', '구름 벽지', 'wallpaper', 36, 2, 'cloud'],
  ].map(([id, name, slot, price, minLevel, collection]) => ({
    id,
    name,
    slot,
    price,
    minLevel,
    collection,
    description: `${name}으로 우리 아이의 방을 꾸며요.`,
    assetKey: id,
  }))
  return {
    catalog,
    inventory: catalog.filter((item) => item.price === 0).map((item) => item.id),
    wallet: { stars: 20, dailyEarned: 0, dailyLimit: 90 },
    room: Object.fromEntries(
      catalog.filter((item) => item.price === 0).map((item) => [item.slot, item.id]),
    ),
    games: {
      active: null,
      rewardedToday: 0,
      dailyRewardLimit: 3,
      bestScores: { memory: 0, snack: 0 },
    },
    achievements: [],
    gamePolicyVersion: 'classic-v2',
  }
}

function decorations(runtime = React) {
  const common = { react: runtime, 'react/jsx-runtime': jsx, './PetRoom.module.css': css }
  const { PetCatalogFilters } = load('src/features/playground-pet/ui/PetCatalogFilters.tsx', {
    ...common,
    '@/entities/playground-pet/model/room': room,
    '../constants/pet-shop': constants,
  })
  const { PetPurchaseDialog } = load('src/features/playground-pet/ui/PetPurchaseDialog.tsx', common)
  const { PetGlyph } = load('src/features/playground-pet/ui/PetGlyph.tsx', common)
  return {
    PetCatalogFilters,
    PetPurchaseDialog,
    ...load('src/features/playground-pet/ui/PetDecorations.tsx', {
      ...common,
      'next/image': { default: (props) => React.createElement('img', props) },
      '@/entities/playground-pet/model/room': room,
      '@/entities/playground-pet/model/shop': shop,
      '../constants/pet-shop': constants,
      '../lib/useServerClock': { petRequestKey: () => crypto.randomUUID() },
      '../lib/gameAssets': { petAsset: () => null },
      './PetGlyph': { PetGlyph },
      './PetCatalogFilters': { PetCatalogFilters },
      './PetPurchaseDialog': { PetPurchaseDialog },
    }),
  }
}

function ui(mode = 'shop') {
  const runtime = hooks(),
    components = decorations(runtime.react)
  const props = {
    mode,
    game: gameFixture(),
    level: 1,
    revision: 7,
    disabled: false,
    manifest: null,
    selected: null,
    onOpenShop() {},
    onSelect(item) {
      props.selected = item
    },
    onCommand() {
      throw new Error('명시적인 클릭 없이 호출하면 안 됨')
    },
  }
  return {
    props,
    components,
    unmount: runtime.unmount,
    render: () => nodes(runtime.render(() => components.PetDecorations(props))),
  }
}
const button = (tree, label) =>
  tree.find((node) => node.type === 'button' && node.props.children === label)

module.exports = { load, room, shop, constants, gameFixture, hooks, decorations, nodes, ui, button }
