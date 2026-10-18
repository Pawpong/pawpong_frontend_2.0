const { test, assert, load, petExposureMode, env } = require('./fixtures/core.fixture.cjs')

test('백엔드 미제공 응답은 설정 비활성으로 처리하고 장애는 재시도 가능하게 반환함', async () => {
  const originalFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://dev-api.example.test'
  try {
    const { GET } = load('src/app/api/playground/pet/config/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
      '@/features/playground-pet/lib/server': load('src/features/playground-pet/lib/server.ts', {
        'server-only': {},
        './environment': { petExposureMode: () => 'development' },
      }),
    })
    for (const status of [404, 503]) {
      global.fetch = async () => ({ status, ok: false })
      const result = await GET({ headers: new Headers({ host: 'localhost' }) })
      assert.equal(result.body.enabled, false)
      assert.equal(result.status, status === 404 ? undefined : 503)
    }
  } finally {
    global.fetch = originalFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})

test('운영은 개발 미리보기와 기본값을 거부하고 명시적인 서버 공개 승인만 허용함', async () => {
  const oldFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://production-api.example.test'
  const server = load('src/features/playground-pet/lib/server.ts', {
    'server-only': {},
    './environment': { petExposureMode: () => 'public' },
  })
  try {
    for (const data of [
      {},
      { enabled: true },
      { enabled: true, publicEnabled: false },
      { enabled: false, publicEnabled: true },
      { enabled: true, publicEnabled: 'true' },
    ]) {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data }),
      })
      assert.equal(await server.isPetServerEnabled('pawpong.kr'), false)
    }
    let options
    global.fetch = async (_url, init) => {
      options = init
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            enabled: true,
            publicEnabled: true,
            policyVersion: 'v1',
            privateAudit: 'must-not-expose',
          },
        }),
      }
    }
    assert.deepEqual((await server.getPetServerConfig('pawpong.kr')).config, {
      enabled: true,
      publicEnabled: true,
      policyVersion: 'v1',
    })
    assert.equal(options.cache, 'no-store')
    global.fetch = async () => {
      throw new Error('backend unavailable')
    }
    assert.equal(await server.isPetServerEnabled('pawpong.kr'), false)
  } finally {
    global.fetch = oldFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})

test('개발 설정은 운영 공개가 꺼진 동안 비공개 미리보기를 유지함', async () => {
  const oldFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://dev-api.example.test'
  const server = load('src/features/playground-pet/lib/server.ts', {
    'server-only': {},
    './environment': { petExposureMode: () => 'development' },
  })
  try {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { enabled: true, publicEnabled: false },
      }),
    })
    assert.deepEqual((await server.getPetServerConfig('localhost:3033')).config, {
      enabled: true,
      publicEnabled: false,
    })
  } finally {
    global.fetch = oldFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})
