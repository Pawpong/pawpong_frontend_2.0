const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
function configFixture(states) {
  const options = [],
    retried = []
  const hook = load('src/features/community/lib/useCommunityEditorConfig.ts', {
    '@tanstack/react-query': {
      useQuery: (value) => {
        const index = options.length
        options.push(value)
        return {
          isSuccess: false,
          isError: false,
          isFetching: false,
          refetch: () => retried.push(index),
          ...states[index],
        }
      },
    },
    '@/entities/community': {
      communityExperienceConfigOptions: { queryKey: ['experience'] },
      communityReviewConfigOptions: { queryKey: ['review'] },
    },
  })
  return { value: hook.useCommunityEditorConfig(), options, retried }
}
test('심사와 경험 설정이 모두 확정되기 전에는 저장을 허용하지 않음', () => {
  for (const states of [
    [{ isSuccess: true }, { isPending: true }],
    [{ isPending: true }, { isSuccess: true }],
    [{ isSuccess: true }, { isError: true }],
    [{ isError: true, data: { enabled: true } }, { isSuccess: true }],
  ])
    assert.equal(configFixture(states).value.ready, false)
  assert.equal(
    configFixture([
      { isSuccess: true, data: { enabled: false } },
      { isSuccess: true, data: { enabled: false } },
    ]).value.ready,
    true,
  )
})
test('설정 실패는 전역 오류 화면으로 던지지 않고 두 설정을 다시 조회함', () => {
  const fixture = configFixture([{ isError: true }, { isSuccess: true }])
  assert.equal(fixture.value.failed, true)
  assert.equal(
    fixture.options.every((value) => value.throwOnError === false),
    true,
  )
  fixture.value.retry()
  assert.deepEqual(fixture.retried, [0, 1])
})
