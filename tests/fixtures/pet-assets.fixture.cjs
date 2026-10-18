const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const settings = load('src/features/playground-pet/constants/pet-assets.ts')
const deadline = load('src/features/playground-pet/lib/petAssetDeadline.ts', {
  '../constants/pet-assets': settings,
})
const image = load('src/features/playground-pet/lib/petAssetImage.ts', {
  './petAssetDeadline': deadline,
})
const assets = load('src/features/playground-pet/lib/gameAssets.ts', {
  './petAssetDeadline': deadline,
})

module.exports = { settings, deadline, image, assets }
