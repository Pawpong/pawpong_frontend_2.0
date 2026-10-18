const { test, assert, load, petExposureMode, env } = require('./fixtures/core.fixture.cjs')

test('프런트엔드 환경이 닫혀 있으면 설정 경로가 백엔드에 접속하지 않음', async () => {
  const originalFetch = global.fetch
  let calls = 0
  global.fetch = async () => {
    calls++
    throw new Error('must not fetch')
  }
  try {
    const { GET } = load('src/app/api/playground/pet/config/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
      '@/features/playground-pet/lib/server': load('src/features/playground-pet/lib/server.ts', {
        'server-only': {},
        './environment': {
          petExposureMode: ({ hostname }) => petExposureMode({ ...env, hostname }),
        },
      }),
    })
    // 프록시 내부 주소가 로컬이어도 운영 호스트 헤더의 공개 제한을 유지한다.
    const response = await GET({
      nextUrl: new URL('http://localhost/api/playground/pet/config'),
      headers: new Headers({ host: 'pawpong.kr' }),
    })
    assert.deepEqual(response.body, { enabled: false })
    assert.equal(response.headers['Cache-Control'], 'private, no-store')
    assert.equal(calls, 0)
  } finally {
    global.fetch = originalFetch
  }
})
