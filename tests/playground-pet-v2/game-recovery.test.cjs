const {
  test,
  assert,
  React,
  renderToStaticMarkup,
  load,
  snack,
  sessionId,
} = require('./fixtures/core.fixture.cjs')

test('만료된 게임은 새로고침과 취소를 안내하고 복원된 간식 완료를 임의 재생하지 않음', () => {
  const jsx = require('react/jsx-runtime')
  const { PetGlyph } = load('src/features/playground-pet/ui/PetGlyph.tsx', {
    'react/jsx-runtime': jsx,
  })
  const { PetMiniGames } = load('src/features/playground-pet/ui/PetMiniGames.tsx', {
    react: React,
    'react-dom': {
      createPortal() {
        throw new Error('No game surface in this render')
      },
    },
    'react/jsx-runtime': jsx,
    '@/entities/playground-pet/model/snack': snack,
    '../lib/useServerClock': { petRequestKey() {} },
    '../lib/usePetStartIntent':
      require('../pet-start-intent/fixtures/intent.fixture.cjs').intentHookFixture(React),
    './PetGlyph': { PetGlyph },
    './PetRoom.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
  })
  const props = {
    game: {
      wallet: { stars: 50, dailyEarned: 0, dailyLimit: 90 },
      games: {
        rewardedToday: 0,
        dailyRewardLimit: 3,
        bestScores: { memory: 0, snack: 0 },
        active: {
          sessionId,
          game: 'memory',
          status: 'active',
          expiresAt: '2026-10-05T00:00:00Z',
          rewardEligible: true,
        },
      },
    },
    gameOutcome: null,
    revision: 7,
    serverTime: '2026-10-05T00:01:00Z',
    now: Date.parse('2026-10-05T00:01:00Z'),
    disabled: false,
    characterReady: true,
    onPrepareGame: async () => true,
    gameSurface: null,
    onCommand() {
      throw new Error('A render must never send a mutation')
    },
    onRefresh() {},
    onSnack() {},
  }
  const expired = renderToStaticMarkup(React.createElement(PetMiniGames, props))
  assert.ok(expired.includes('게임 시간이 만료됐어요'))
  assert.ok(expired.includes('최신 상태 확인'))
  assert.equal(expired.includes('1번 카드'), false)
  const restored = renderToStaticMarkup(
    React.createElement(PetMiniGames, {
      ...props,
      game: {
        ...props.game,
        games: {
          ...props.game.games,
          active: { ...props.game.games.active, game: 'snack', expiresAt: '2026-10-05T00:04:00Z' },
        },
      },
    }),
  )
  assert.ok(restored.includes('이 판의 이동 기록이 이 화면에 없어요'))
  assert.ok(restored.includes('이 판 종료'))
  assert.equal(restored.includes('결과 저장하고 별사탕 확인'), false)
})
