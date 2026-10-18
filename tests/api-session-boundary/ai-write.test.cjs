const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  apiFixture,
  token,
  deferred,
  unauthorized,
  response,
} = require('./fixtures/api.fixture.cjs')

const operations = {
  upload: (h, options) =>
    h.api.uploadAiImageSource(new File(['합성 사진'], 'fixture.png'), options),
  generation: (h, options) =>
    h.api.requestAiImageGeneration(
      {
        filterId: 'fixture',
        inputObjectKey: 'ai-image/source/fixture.png',
        generationPurpose: 'pet-sprite-v1',
      },
      options,
    ),
}

for (const [name, execute] of Object.entries(operations)) {
  test(`${name === 'upload' ? '원본 업로드' : 'AI 생성'} 인증 만료는 인증만 갱신하고 직접 다시 눌러야 전송함`, async () => {
    const h = apiFixture(),
      calls = []
    h.apiClient.defaults.adapter = async (config) => {
      calls.push(config)
      return calls.length === 1 ? unauthorized(config) : response(config)
    }
    await assert.rejects(execute(h), { status: 401 })
    assert.equal(h.state.refreshes, 1)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].skipAuthRefresh, true)
    await execute(h)
    assert.equal(calls.length, 2)
    assert.equal(calls[1].headers.Authorization, `Bearer ${token('owner-a', 2)}`)
  })

  test(`${name === 'upload' ? '원본 업로드' : 'AI 생성'}은 작업 시작 계정이 바뀌면 요청 전에 차단함`, async () => {
    const h = apiFixture(),
      captured = h.session.getAuthReadSession()
    let calls = 0
    h.apiClient.defaults.adapter = async (config) => {
      calls++
      return response(config)
    }
    h.state.token = token('owner-b')
    await assert.rejects(execute(h, { session: captured }), /계정|로그인/)
    assert.equal(calls, 0)
  })

  test(`${name === 'upload' ? '원본 업로드' : 'AI 생성'}의 늦은 인증 실패는 새 계정에서 복구하지 않음`, async () => {
    const h = apiFixture(),
      gate = deferred(),
      started = deferred()
    let calls = 0
    h.apiClient.defaults.adapter = async (config) => {
      calls++
      started.resolve()
      await gate.promise
      return unauthorized(config)
    }
    const work = execute(h)
    await started.promise
    h.state.token = token('owner-b')
    gate.resolve()
    await assert.rejects(work, /계정/)
    assert.equal(h.state.refreshes, 0)
    assert.equal(calls, 1)
  })

  test(`${name === 'upload' ? '원본 업로드' : 'AI 생성'}의 이전 계정 성공 결과를 현재 계정에 반환하지 않음`, async () => {
    const h = apiFixture()
    h.apiClient.defaults.adapter = async (config) => {
      h.state.token = token('owner-b')
      return response(config)
    }
    await assert.rejects(execute(h), /계정/)
  })
}

test('이미 취소되거나 로그아웃된 AI 요청은 파일과 생성 내용을 전송하지 않음', async () => {
  const h = apiFixture(),
    controller = new AbortController()
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return response(config)
  }
  controller.abort()
  for (const execute of Object.values(operations))
    await assert.rejects(execute(h, { signal: controller.signal }))
  h.state.token = null
  for (const execute of Object.values(operations)) await assert.rejects(execute(h), { status: 401 })
  assert.equal(calls, 0)
})
