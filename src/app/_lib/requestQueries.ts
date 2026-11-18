import 'server-only'
import { AsyncLocalStorage } from 'node:async_hooks'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { QueryClient, dehydrate, type QueryFunction, type QueryKey } from '@tanstack/react-query'
import { isApiError, setServerTokenReader } from '@/shared/api'

/** Query Factory 결과를 그대로 받는다. 서버에서는 키와 조회 함수만 쓴다 (staleTime 등은 브라우저 몫) */
export interface RequestQuery<T = unknown> {
  queryKey: QueryKey
  queryFn?: QueryFunction<T, QueryKey, never>
}

// 요청마다 따로 보관되는 토큰. 같은 순간에 들어온 다른 사용자의 요청과 섞이지 않는다.
const requestToken = new AsyncLocalStorage<string | null>()
setServerTokenReader(() => requestToken.getStore() ?? null)

// 백엔드가 느려도 메타데이터·본문이 끝없이 늘어지지 않게 끊는다. 못 받은 쿼리는 브라우저가 평소대로 받는다.
const REQUEST_TIMEOUT_MS = 3000

// 요청 하나에 하나씩. generateMetadata 와 페이지가 같은 캐시를 봐서 같은 조회를 두 번 보내지 않는다.
// 서버에서는 재시도하지 않는다 — 기다리는 동안 화면이 늦어질 뿐이고 브라우저가 다시 받는다.
const getRequestQueryClient = cache(
  () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } }),
)

// 판정은 requireAuth 와 같이 값으로 한다 (삭제된 쿠키가 빈 값으로 남는 경우가 있다)
const getRequestToken = cache(
  async () => (await cookies()).get('accessToken')?.value?.trim() || null,
)

const fetchAs = async <T>(query: RequestQuery<T>, token: string | null): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      requestToken.run(token, () => getRequestQueryClient().fetchQuery(query)),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('server query timeout')), REQUEST_TIMEOUT_MS)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

const runQuery = async <T>(query: RequestQuery<T>, anonymousFallback = true): Promise<T> => {
  // 이 요청에서 이미 실패한 조회는 다시 보내지 않는다 (메타데이터에서 400 난 입양자 조회 등)
  const state = getRequestQueryClient().getQueryState(query.queryKey)
  if (state?.status === 'error' && state.fetchStatus === 'idle') throw state.error
  const token = await getRequestToken()
  try {
    return await fetchAs(query, token)
  } catch (error) {
    // 만료된 토큰이면 익명으로 한 번 더 받는다. 서버는 토큰을 갱신하지 않으므로, 그대로 두면
    // 공개 글도 메타데이터가 '콘텐츠를 확인해 주세요' 로 나간다. 개인 값은 브라우저가 갱신 뒤 다시 받는다.
    if (anonymousFallback && token && isApiError(error) && error.status === 401)
      return fetchAs(query, null)
    throw error
  }
}

/** 이 요청 사용자의 토큰으로 받는다. 실패하면 null. 같은 요청의 화면 프리패치와 결과를 같이 쓴다 */
export const fetchForRequest = <T>(query: RequestQuery<T>): Promise<T | null> =>
  runQuery(query).catch(() => null)

/**
 * 첫 화면 쿼리를 받아 브라우저 캐시로 넘길 상태를 만든다.
 * 실패·시간 초과한 쿼리는 넘기지 않는다(dehydrate 기본값이 성공한 쿼리만 담는다).
 * loggedInQueries 는 로그인 요청에서만 받는다 (비로그인이면 어차피 401 이라 백엔드를 부르지 않는다).
 */
export const dehydrateForRequest = async (
  queries: RequestQuery[] = [],
  loggedInQueries: RequestQuery[] = [],
) => {
  const loggedIn = (await getRequestToken()) !== null
  await Promise.allSettled([
    ...queries.map((query) => runQuery(query)),
    // 로그인해야만 받는 값이라 토큰이 거절되면 익명으로 다시 부르지 않는다
    ...(loggedIn ? loggedInQueries.map((query) => runQuery(query, false)) : []),
  ])
  return dehydrate(getRequestQueryClient())
}
