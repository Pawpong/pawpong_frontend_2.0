const { loadModule: load } = require('../../helpers/load-module.cjs')

const mood = load('src/entities/playground-pet/model/mood.ts')
const room = load('src/entities/playground-pet/model/room.ts')
const snack = load('src/entities/playground-pet/model/snack.ts')
const settings = load('src/features/playground-pet/constants/pet-motion.ts')
const motion = load('src/features/playground-pet/lib/petMotion.ts', {
  '../constants/pet-motion': settings,
})
const stats = (extra = {}) => ({ fullness: 60, mood: 60, energy: 60, affinity: 0, ...extra })

module.exports = { load, mood, room, snack, settings, motion, stats }
