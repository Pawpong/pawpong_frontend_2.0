import { isApiError } from './unwrap'

const TRANSIENT_ERROR_REFETCH_INTERVAL = 30_000

interface QueryWithErrorState {
  state: {
    status: string
    error: unknown
  }
}

/**
 * 네트워크 단절과 5xx처럼 사용자가 고칠 수 없는 일시 장애만 자동 복구한다.
 * 4xx는 잘못된 대상·권한·세션 문제일 수 있으므로 주기적으로 재호출하지 않는다.
 */
export const getTransientErrorRefetchInterval = (query: QueryWithErrorState) => {
  if (query.state.status !== 'error' || !isApiError(query.state.error)) return false

  const { status } = query.state.error
  return status === undefined || status >= 500 ? TRANSIENT_ERROR_REFETCH_INTERVAL : false
}

/** 화면을 다시 보거나 네트워크가 복구될 때 일시 실패한 프로필을 즉시 재확인한다. */
export const transientQueryRecoveryOptions = {
  refetchInterval: getTransientErrorRefetchInterval,
  refetchOnReconnect: 'always' as const,
  refetchOnWindowFocus: 'always' as const,
}
