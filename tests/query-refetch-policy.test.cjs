const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const factory = () =>
  load('src/shared/api/queryFactory.ts', {
    '@tanstack/react-query': {
      infiniteQueryOptions: (value) => value,
      queryOptions: (value) => value,
    },
  })

// 신선한 캐시가 있으면 화면에 다시 들어와도 다시 받지 않는다 (#639).
// 'always' 를 기본으로 두면 staleTime 이 무시되고, 무한 목록은 불러온 페이지를 전부 다시 받았다.
test('쿼리 공장은 기본으로 staleTime 이 지난 데이터만 마운트 때 다시 받음', () => {
  const { createQuery, createInfiniteQuery, createInfiniteQueryWithHasMore, STALE_TIME } = factory()
  const queryFn = async () => ({ items: [], pagination: {} })
  for (const create of [createQuery, createInfiniteQuery, createInfiniteQueryWithHasMore]) {
    assert.equal(create({ queryKey: ['x'], queryFn }).refetchOnMount, true)
    assert.equal(
      create({ queryKey: ['x'], queryFn, staleTime: STALE_TIME.STATIC }).refetchOnMount,
      true,
    )
  }
})

test('들어올 때 반드시 최신이어야 하는 화면은 직접 지정한 값을 그대로 씀', () => {
  const { createQuery, createInfiniteQuery } = factory()
  const queryFn = async () => ({ items: [], pagination: {} })
  assert.equal(
    createQuery({ queryKey: ['x'], queryFn, refetchOnMount: 'always' }).refetchOnMount,
    'always',
  )
  assert.equal(
    createInfiniteQuery({ queryKey: ['x'], queryFn, refetchOnMount: false }).refetchOnMount,
    false,
  )
})
