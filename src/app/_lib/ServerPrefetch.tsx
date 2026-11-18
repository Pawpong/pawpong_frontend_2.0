import 'server-only'
import type { ReactNode } from 'react'
import { HydrationBoundary } from '@tanstack/react-query'
import { dehydrateForRequest, type RequestQuery } from './requestQueries'

interface ServerPrefetchProps {
  /**
   * 첫 화면에 꼭 필요한 쿼리만. 클라이언트 컴포넌트가 쓰는 Query Factory 를 그대로 넘긴다.
   * 같은 요청에서 메타데이터·페이지가 fetchForRequest 로 이미 받은 것도 함께 넘어간다.
   */
  queries?: RequestQuery[]
  /** 로그인 방문에서만 받을 쿼리 (내 프로필처럼 비로그인이면 401 인 것) */
  loggedInQueries?: RequestQuery[]
  children: ReactNode
}

/**
 * 첫 화면 데이터를 서버에서 받아 HTML 에 바로 싣는다. 안쪽 클라이언트 컴포넌트는 고치지 않아도
 * 같은 queryKey 로 캐시에서 찾아 쓴다. 로그인 사용자는 본인 토큰으로 받아 찜·내 신청 같은 값도 맞다.
 *
 * 쿠키를 읽으므로 이 페이지는 요청마다 새로 만들어진다. 개인 값이 HTML 에 들어가니
 * 이 컴포넌트를 쓰는 페이지에 ISR(revalidate)·'use cache' 를 붙이지 않는다 (tests/server-prefetch.test.cjs).
 * 기다리는 동안의 화면은 같은 폴더의 loading.tsx 가 맡는다.
 */
export const ServerPrefetch = async ({
  queries,
  loggedInQueries,
  children,
}: ServerPrefetchProps) => (
  <HydrationBoundary state={await dehydrateForRequest(queries, loggedInQueries)}>
    {children}
  </HydrationBoundary>
)
