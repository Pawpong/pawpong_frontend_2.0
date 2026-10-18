const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderDiscoveryQuery } = require('./fixtures/discovery-query.fixture.cjs')

test('필터 설정을 읽는 중이거나 실패하면 조건 없는 목록을 대신 요청하지 않는다', () => {
  for (const config of [{ isPending: true }, { isError: true }]) {
    const { options, configOptions } = renderDiscoveryQuery(config)
    assert.equal(options.enabled, false)
    assert.equal(options.throwOnError, false)
    assert.equal(configOptions.throwOnError, false)
  }
})

test('필터를 사용하지 않는 목록은 선택 기능 장애와 별개로 조회할 수 있다', () => {
  assert.equal(renderDiscoveryQuery({ isError: true }, '').options.enabled, true)
  assert.equal(renderDiscoveryQuery({ data: { enabled: true, topics: [] } }).options.enabled, true)
})
