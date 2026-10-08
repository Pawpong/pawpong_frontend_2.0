const { test, assert, auth, load, flush } = require('./fixtures/core.fixture.cjs')
const { mount } = require('./fixtures/transform.fixture.cjs')

test('캐시된 설정이 활성화여도 재조회 실패 시 캐릭터 생성을 잠그고 일반 사진은 유지함', () => {
  let config = { data: { enabled: true }, isPending: false, isError: true }
  const options = []
  const studio = () => null
  const { petConfigOptions } = load('src/entities/playground-pet/api/pet.queries.ts', {
    './pet.api': { getPetConfig: async () => config.data },
  })
  const { AiFilterContent } = load('src/app/(main)/ai-filter/_ui/AiFilterContent.tsx', {
    react: { useEffect() {} },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/features/ai-image': { AiFilterStudio: studio },
    '@/features/auth': { useMe: () => ({ isLoggedIn: true }) },
    '@/features/in-app-purchase': {
      usePurchases: () => ({ refresh: async () => {}, account: { isError: false } }),
    },
    '@/entities/iap': { featureAllowance: () => undefined },
    '@tanstack/react-query': {
      useQuery: (value) => {
        options.push(value)
        return config
      },
    },
    '@/entities/playground-pet': { petConfigOptions },
  })
  const closed = AiFilterContent({ gameCharacter: true })
  assert.equal(closed.type, 'p')
  assert.equal(closed.props.role, 'status')
  assert.equal(AiFilterContent({}).type, studio)
  assert.deepEqual(
    options.map((option) => option.enabled),
    [true, false],
  )
  config = { ...config, isError: false }
  assert.equal(AiFilterContent({ gameCharacter: true }).type, studio)
})

test('캐릭터 생성은 설정 폴링과 화면 복귀 갱신 및 캐시된 설정의 오류를 공유함', async (t) => {
  const previousWindow = global.window
  global.window = { addEventListener() {}, removeEventListener() {} }
  const { QueryClient, QueryObserver, focusManager } = require('@tanstack/react-query')
  const previousFocus = focusManager.isFocused()
  t.mock.timers.enable({ apis: ['Date', 'setTimeout', 'setInterval'], now: 1000 })
  let requests = 0,
    fail = false,
    observer,
    options
  const { petConfigOptions } = load('src/entities/playground-pet/api/pet.queries.ts', {
    './pet.api': {
      getPetConfig: async () => {
        requests++
        if (fail) throw new Error('config temporarily unavailable')
        return { enabled: false }
      },
    },
  })
  const studio = () => null
  const { AiFilterContent } = load('src/app/(main)/ai-filter/_ui/AiFilterContent.tsx', {
    react: { useEffect() {} },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/features/ai-image': { AiFilterStudio: studio },
    '@/features/auth': { useMe: () => ({ isLoggedIn: true }) },
    '@/features/in-app-purchase': {
      usePurchases: () => ({ refresh: async () => {}, account: { isError: false } }),
    },
    '@/entities/iap': { featureAllowance: () => undefined },
    '@/entities/playground-pet': { petConfigOptions },
    '@tanstack/react-query': {
      useQuery(value) {
        options = value
        return observer?.getCurrentResult() ?? { data: { enabled: true } }
      },
    },
  })
  const client = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, staleTime: Infinity, gcTime: Infinity },
    },
  })
  client.mount()
  focusManager.setFocused(true)
  assert.equal(AiFilterContent({ gameCharacter: true }).type, studio)
  client.setQueryData(options.queryKey, { enabled: true })
  observer = new QueryObserver(client, options)
  const unsubscribe = observer.subscribe(() => {})
  try {
    t.mock.timers.tick(30_000)
    await flush()
    assert.equal(requests, 1)
    assert.equal(AiFilterContent({ gameCharacter: true }).type, 'p')
    client.setQueryData(options.queryKey, { enabled: true })
    focusManager.setFocused(false)
    t.mock.timers.tick(31_000)
    await flush()
    assert.equal(requests, 1)
    focusManager.setFocused(true)
    await flush()
    assert.equal(requests, 2)
    assert.equal(AiFilterContent({ gameCharacter: true }).type, 'p')
    client.setQueryData(options.queryKey, { enabled: true })
    fail = true
    focusManager.setFocused(false)
    t.mock.timers.tick(31_000)
    focusManager.setFocused(true)
    await flush()
    assert.equal(requests, 3)
    assert.equal(observer.getCurrentResult().data.enabled, true)
    assert.equal(observer.getCurrentResult().isError, true)
    assert.equal(AiFilterContent({ gameCharacter: true }).type, 'p')
    assert.equal(AiFilterContent({}).type, studio)
  } finally {
    unsubscribe()
    observer.destroy()
    client.unmount()
    client.clear()
    focusManager.setFocused(previousFocus)
    global.window = previousWindow
  }
})
