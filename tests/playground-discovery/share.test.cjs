const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  model,
  share,
  constants,
  fakeNavigator,
  abortError,
} = require('./fixtures/discovery.fixture.cjs')

const card = constants.TASTE_CARDS.observer
const content = { title: card.title, text: model.playCardText(card) }

test('공유 문구에는 카드 내용과 진단이나 경로 추천이 아니라는 안내가 함께 담김', () => {
  const lines = content.text.split('\n')
  assert.equal(lines[0], `포퐁 · ${card.label}`)
  assert.ok(lines.includes(card.title))
  assert.equal(lines.at(-1), constants.PLAY_CARD_NOTICE)
  assert.match(constants.PLAY_CARD_NOTICE, /AI 분석/)
  assert.match(constants.PLAY_CARD_NOTICE, /실제 경로 추천이 아니에요/)
})

test('시스템 공유가 있으면 공유창을 쓰고 클립보드는 건드리지 않음', async () => {
  const { nav, calls } = fakeNavigator({ share: async () => {}, clipboard: async () => {} })
  assert.equal(await share.sharePlayCard(nav, content), 'shared')
  assert.deepEqual(
    calls.map(([kind]) => kind),
    ['share'],
  )
})

test('공유창을 닫으면 실패가 아니라 취소로 안내하고 복사 대체 화면을 열지 않음', async () => {
  const { nav, calls } = fakeNavigator({
    share: async () => {
      throw abortError()
    },
    clipboard: async () => {},
  })
  assert.equal(await share.sharePlayCard(nav, content), 'cancelled')
  assert.deepEqual(
    calls.map(([kind]) => kind),
    ['share'],
  )
  assert.match(share.PLAY_SHARE_MESSAGES.cancelled, /카드는 그대로/)
})

test('공유창이 없으면 클립보드로 복사하고 둘 다 없거나 실패하면 직접 복사로 넘어감', async () => {
  const copy = fakeNavigator({ clipboard: async () => {} })
  assert.equal(await share.sharePlayCard(copy.nav, content), 'copied')
  assert.equal(copy.calls[0][1], content.text)
  assert.equal(await share.sharePlayCard({}, content), 'fallback')
  const denied = fakeNavigator({
    clipboard: async () => {
      throw Object.assign(new Error('권한 없음'), { name: 'NotAllowedError' })
    },
  })
  assert.equal(await share.sharePlayCard(denied.nav, content), 'fallback')
  const broken = fakeNavigator({
    share: async () => {
      throw new TypeError('지원하지 않음')
    },
  })
  assert.equal(await share.sharePlayCard(broken.nav, content), 'fallback')
})
