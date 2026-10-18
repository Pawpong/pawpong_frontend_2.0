const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

test('저장 응답 뒤 목록 갱신이 끝날 때까지 입력과 중복 저장 잠금을 유지함', async () => {
  let finishInvalidation
  const invalidation = new Promise((resolve) => {
    finishInvalidation = resolve
  })
  const busy = [],
    errors = []
  let calls = 0
  const { useSubmitCommunityPostForm } = load(
    'src/features/community/lib/useSubmitCommunityPostForm.ts',
    {
      react: {
        useRef: (value) => ({ current: value }),
        useState: (initial) => [
          initial,
          (value) => (initial === false ? busy : errors).push(value),
        ],
        useEffect: (effect) => effect(),
      },
      '@tanstack/react-query': {
        useQueryClient: () => ({}),
        useMutation: (options) => ({ mutateAsync: options.mutationFn, isPending: false }),
      },
      '@/shared/lib/useAccessToken': { useAccessToken: () => 'synthetic-token' },
      './submitCommunityPostForm': {
        submitCommunityPostForm: async () => {
          calls++
          return { postId: 'saved' }
        },
      },
      './communityWriteSession': { captureCommunityWriteSession: () => () => {} },
      '../api/community.cache': { invalidateCommunityPostLists: () => invalidation },
    },
  )
  const hook = useSubmitCommunityPostForm()
  const pending = hook.submit({})
  await Promise.resolve()
  assert.deepEqual(busy, [true])
  assert.equal(await hook.submit({}), null)
  assert.equal(calls, 1)
  finishInvalidation()
  assert.deepEqual(await pending, { postId: 'saved' })
  assert.deepEqual(busy, [true, false])
  assert.deepEqual(errors, [null])
})
