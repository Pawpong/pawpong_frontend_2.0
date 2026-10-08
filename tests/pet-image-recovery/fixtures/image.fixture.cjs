const { load } = require('../../pet-shop/fixtures/shop.fixture.cjs')
const { hooks, nodes } = require('../../fixtures/react-hooks.fixture.cjs')
const jsx = require('react/jsx-runtime')

function portraitFixture() {
  const outer = hooks()
  let active = outer,
    child = null,
    childKey = null
  const { PetImage } = load('src/features/playground-pet/ui/PetImage.tsx', {
    react: { useState: (...args) => active.react.useState(...args) },
    'react/jsx-runtime': jsx,
    'next/image': { default: 'image' },
    '@/shared/assets': { PawPrintIcon: 'icon' },
    '@/shared/ui/Button': { Button: 'button' },
  })
  return {
    render(props) {
      active = outer
      const tree = outer.render(() => PetImage({ alt: '합성 캐릭터', ...props }))
      if (typeof tree.type !== 'function') return nodes(tree)
      if (tree.key !== childKey || !child) {
        child = hooks()
        childKey = tree.key
      }
      active = child
      return nodes(child.render(() => tree.type(tree.props)))
    },
  }
}

function assetFixture() {
  let active = hooks(),
    childKey = null
  const css = { default: new Proxy({}, { get: (_, key) => String(key) }) }
  const { PetAssetThumbnail } = load('src/features/playground-pet/ui/PetAssetThumbnail.tsx', {
    react: { useState: (...args) => active.react.useState(...args) },
    'react/jsx-runtime': jsx,
    'next/image': { default: 'image' },
    '../lib/gameAssets': load('src/features/playground-pet/lib/gameAssets.ts'),
    './PetRoom.module.css': css,
  })
  return {
    render(props) {
      const tree = PetAssetThumbnail(props),
        child = tree.props.children
      if (typeof child.type !== 'function') return nodes(tree)
      if (child.key !== childKey) {
        active = hooks()
        childKey = child.key
      }
      return nodes(active.render(() => child.type(child.props)))
    },
  }
}

module.exports = { portraitFixture, assetFixture }
