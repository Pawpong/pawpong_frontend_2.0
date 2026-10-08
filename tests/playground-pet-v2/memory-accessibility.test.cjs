const {
  test,
  assert,
  React,
  renderToStaticMarkup,
  load,
  snack,
  sessionId,
} = require('./fixtures/core.fixture.cjs')

test('기억 게임은 공개된 그림만 표시하고 키보드 버튼과 오답 잠금을 유지함', () => {
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
