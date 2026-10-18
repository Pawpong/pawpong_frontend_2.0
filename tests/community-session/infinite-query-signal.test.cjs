const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

test('무한 목록의 페이지와 취소 신호를 함께 전달하고 다음 페이지 계약을 유지함', async () => {
  const { createInfiniteQuery } = load('src/shared/api/queryFactory.ts', {
    '@tanstack/react-query': { infiniteQueryOptions: value => value, queryOptions: value => value },
  })
  const requests = []
  const options = createInfiniteQuery({
    queryKey: ['synthetic-list'],
    queryFn: async (page, signal) => { requests.push({ page, signal }); return { items: [] } },
  })
  const signal = new AbortController().signal
  await options.queryFn({ pageParam: 2, signal })
  assert.deepEqual(requests, [{ page: 2, signal }])
  assert.equal(options.initialPageParam, 1)
  assert.equal(options.getNextPageParam({ pagination: { currentPage: 2, hasNextPage: true } }), 3)
  assert.equal(options.getNextPageParam({ pagination: { currentPage: 2, hasNextPage: false } }), undefined)
})
