const { test } = require('node:test')
const assert = require('node:assert/strict')
const { navigation, navigationFixture, load } = require('./fixtures/navigation.fixture.cjs')
const sourceId = '0123456789abcdef01234567'

test('탭과 캐릭터 선택은 허용된 값만 내부 경로로 조합함', () => {
  assert.equal(
    navigation.petPageHref({ tab: 'shop', sourceJobId: sourceId }),
    `/playground/pet?sourceJobId=${sourceId}&tab=shop`,
  )
  assert.equal(
    navigation.petPageHref({ tab: 'external', sourceJobId: '../../other' }),
    '/playground/pet',
  )
  assert.equal(navigation.normalizePetSourceJobId(sourceId.toUpperCase()), sourceId)
  assert.equal(navigation.petTabFromSearch(null), 'room')
})

test('상점과 꾸미기 선택은 기록을 추가하지 않고 주소에 남기며 복귀 후 복원됨', () => {
  const f = navigationFixture(`/playground/pet?sourceJobId=${sourceId}&tab=shop`)
  assert.equal(f.render().tab, 'shop')
  f.render().selectTab('decorate')
  assert.equal(f.location().searchParams.get('tab'), 'decorate')
  assert.equal(f.render().tab, 'decorate')
  assert.equal(f.render().sourceJobId, sourceId)
  f.navigate(`/playground/pet?tab=records`)
  assert.equal(f.render().tab, 'records')
  f.render().selectTab('room')
  assert.equal(f.location().href, 'https://example.test/playground/pet')
  assert.equal(f.replacements.length, 2)
})

test('진행 중인 게임은 게임 탭을 유지하고 완료 후에도 결과 화면에 남음', () => {
  const f = navigationFixture('/playground/pet?tab=shop')
  assert.equal(f.render('game-id').tab, 'games')
  f.render('game-id').selectTab('room')
  assert.equal(f.location().searchParams.get('tab'), 'games')
  assert.equal(f.render(null).tab, 'games')
  assert.equal(f.replacements.length, 1)
})

test('캐릭터 연결 취소는 현재 탭을 보존하고 다른 화면에서는 주소를 바꾸지 않음', () => {
  const f = navigationFixture(`/playground/pet?sourceJobId=${sourceId}&tab=shop`)
  f.render().clearSource()
  assert.equal(f.render().sourceJobId, undefined)
  assert.equal(f.render().tab, 'shop')
  f.navigate('/community')
  f.render().selectTab('games')
  assert.equal(f.location().pathname, '/community')
  assert.equal(f.replacements.length, 1)
})

test('로그인 안내는 현재 검색 조건과 탭 및 위치를 복귀 주소에 보존함', () => {
  const calls = []
  const { LoginPromptModal } = load(
    'src/shared/ui/LoginPromptModal.tsx',
    {
      'react/jsx-runtime': require('react/jsx-runtime'),
      'next/navigation': {
        usePathname: () => '/community',
        useRouter: () => ({ push: (href) => calls.push(href) }),
      },
      './CtaModal': { CtaModal: () => null },
      '../lib/normalizeReturnUrl': load('src/shared/lib/normalizeReturnUrl.ts'),
    },
    {
      window: { location: new URL('https://example.test/community?petType=dog&query=산책#post-1') },
    },
  )
  LoginPromptModal({
    open: true,
    onOpenChange() {},
    description: '로그인 안내',
  }).props.actions[0].onClick()
  assert.equal(
    new URL(calls[0], 'https://example.test').searchParams.get('returnUrl'),
    '/community?petType=dog&query=%EC%82%B0%EC%B1%85#post-1',
  )
})
