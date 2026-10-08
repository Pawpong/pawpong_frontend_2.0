const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./fixtures/notification.fixture.cjs')

test('새 계정의 알림 조회를 기다리는 동안 앱 배지를 0으로 지움', () => {
  const effects = []
  const sent = []
  const { AppBadgeSync } = load(
    'src/widgets/gnb/ui/AppBadgeSync.tsx',
    {
      react: { useEffect: (effect) => effects.push(effect) },
      '@tanstack/react-query': { useQuery: () => ({ data: undefined, refetch: async () => {} }) },
      '@/features/auth': { useAuthStatus: () => ({ isReady: true, isLoggedIn: true }) },
      '@/entities/notification': { notificationQueries: { unreadCount: () => ({}) } },
      '@/shared/lib/useAuthReadSession': { useAuthReadSession: () => ({ scope: 'new-account' }) },
      '@/shared/lib/nativeBridge': {
        setNativeAppBadge: (count) => sent.push(count),
        subscribeNativeCapabilities: () => () => {},
      },
    },
    { window: { addEventListener() {}, removeEventListener() {} } },
  )
  AppBadgeSync()
  const cleanups = effects.map((effect) => effect())
  assert.deepEqual(sent, [0])
  cleanups.forEach((cleanup) => cleanup?.())
})
