const {
  test,
  assert,
  load,
  ApiError,
  unwrap,
  command,
  view,
} = require('./fixtures/core.fixture.cjs')

test('API는 계약된 경로와 본문만 전송하고 클라이언트 보상과 사진 주소를 제외함', async () => {
  const calls = []
  const response = { data: { success: true, data: view(8) } }
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': {
      API_VERSION: '/api/v2',
      apiClient: {
        get: async (...args) => {
          calls.push(['GET', ...args])
          return response
        },
        post: async (...args) => {
          calls.push(['POST', ...args])
          return response
        },
      },
    },
    '@/shared/api/unwrap': { ApiError, unwrap },
    '@/shared/api/token': { getAccessToken: () => 'fixture-pet-session' },
  })
  await api.getPet()
  await api.getEligiblePetImages('page-2')
  await api.runPetCommand(command)
  const adopt = {
    kind: 'adopt',
    body: { name: '도토리', sourceJobId: 'source-1', idempotencyKey: 'adopt-request-key' },
  }
  await api.runPetCommand(adopt)
  assert.equal(calls[0][1], '/api/v2/playground/pet/me')
  assert.equal(calls[1][1], '/api/v2/playground/pet/eligible-images')
  assert.equal(calls[1][2].params.cursor, 'page-2')
  assert.deepEqual(calls[2].slice(0, 3), ['POST', '/api/v2/playground/pet/actions', command.body])
  assert.deepEqual(calls[3].slice(0, 3), ['POST', '/api/v2/playground/pet/adopt', adopt.body])
})

test('캐릭터 자격은 서버 커서로 조회하고 입력 주소와 필터 이름을 신뢰하지 않음', async () => {
  const cursors = []
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': {
      API_VERSION: '/api/v2',
      apiClient: {
        get: async (_url, options) => {
          cursors.push(options.params?.cursor ?? null)
          return {
            data: {
              success: true,
              data: options.params?.cursor
                ? { images: [{ sourceJobId: 'allowed' }], nextCursor: null }
                : { images: [], nextCursor: 'page2' },
            },
          }
        },
      },
    },
    '@/shared/api/unwrap': { ApiError, unwrap },
    '@/shared/api/token': { getAccessToken: () => 'fixture-pet-session' },
  })
  assert.equal(await api.isEligiblePetImage('allowed'), true)
  assert.deepEqual(cursors, [null, 'page2'])
  assert.equal(await api.isEligiblePetImage('arbitrary-url'), false)
})
