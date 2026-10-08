const fs = require('node:fs')
const path = require('node:path')
const { loadTypescript } = require('../../helpers/load-typescript.cjs')

const root = 'src/features/playground-tools'
const constants = loadTypescript(`${root}/constants/discovery.ts`)
const model = loadTypescript(`${root}/model/discovery.ts`, {
  '../constants/discovery': constants,
})
const share = loadTypescript(`${root}/lib/sharePlayCard.ts`)

const source = (file) => fs.readFileSync(path.resolve(file), 'utf8')

function allCards() {
  const outing = Object.values(constants.OUTING_DECKS).flatMap((paces) =>
    Object.values(paces).flat(),
  )
  return [...outing, ...Object.values(constants.TASTE_CARDS)]
}

// 공유 API 흉내. 호출 기록을 남기고 지정한 결과를 돌려준다.
function fakeNavigator({ share, clipboard } = {}) {
  const calls = []
  const nav = {}
  if (share)
    nav.share = async (data) => {
      calls.push(['share', data])
      return share(data)
    }
  if (clipboard)
    nav.clipboard = {
      writeText: async (text) => {
        calls.push(['clipboard', text])
        return clipboard(text)
      },
    }
  return { nav, calls }
}

const abortError = () => Object.assign(new Error('취소'), { name: 'AbortError' })

module.exports = { constants, model, share, source, allCards, fakeNavigator, abortError }
