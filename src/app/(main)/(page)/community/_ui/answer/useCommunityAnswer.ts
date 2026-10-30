'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { readCommunityAiAnswer, requestCommunityAiAnswer } from '@/entities/community'
import { ApiError, AuthWriteRetryRequiredError } from '@/shared/api'
import { isAuthReadSessionCurrent, type AuthReadSession } from '@/shared/lib/authReadSession'

function requestErrorMessage(error: unknown) {
  if (error instanceof AuthWriteRetryRequiredError) return error.message
  if (error instanceof ApiError) {
    if (error.status === 429) return '오늘 AI 질문 3회를 모두 사용했어요. 내일 다시 이용해 주세요.'
    if (error.status === 403) return '내가 작성한 질문에서만 AI 답변을 요청할 수 있어요.'
    if (error.status === 404)
      return '질문이 수정되었거나 공개 상태가 바뀌었어요. 글을 다시 확인해 주세요.'
  }
  return '요청 결과를 확인하지 못했어요. 새로 만들기 전에 답변 상태부터 확인합니다.'
}

export function useCommunityAnswer({
  postId,
  context,
  session,
  canRequest,
}: {
  postId: string
  context: string
  session: AuthReadSession | null
  canRequest: boolean
}) {
  const client = useQueryClient()
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'requesting' | 'checking'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(true)
  // 좋아요 등 게시글 낙관적 갱신의 롤백 대상과 답변 원장을 분리한다.
  const queryKey = ['community-ai-answer', context]
  const options = {
    queryKey,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      readCommunityAiAnswer(postId, signal, session),
    retry: false as const,
    throwOnError: false,
    gcTime: 0,
    staleTime: 5000,
  }
  const result = useQuery({
    ...options,
    enabled: phase === 'idle',
    refetchInterval: (query) =>
      query.state.status !== 'error' && query.state.data?.status === 'pending' ? 2000 : false,
  })

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      controller.current?.abort()
    }
  }, [])

  async function request() {
    if (
      controller.current ||
      !consent ||
      !canRequest ||
      !session ||
      !isAuthReadSessionCurrent(session) ||
      result.isPending ||
      result.isError ||
      result.isFetching ||
      result.data?.status === 'completed' ||
      result.data?.status === 'pending'
    )
      return
    const attempt = new AbortController()
    controller.current = attempt
    const current = () =>
      mounted.current && !attempt.signal.aborted && isAuthReadSessionCurrent(session)
    setConsent(false)
    setMessage(null)
    setPhase('requesting')
    try {
      // 늦게 도착한 조회 결과가 새 생성 상태를 덮어쓰지 않게 한다.
      await client.cancelQueries({ queryKey, exact: true })
      if (!current()) return
      const answer = await requestCommunityAiAnswer(postId, attempt.signal, session)
      if (!current()) return
      await client.cancelQueries({ queryKey, exact: true })
      if (!current()) return
      client.setQueryData(queryKey, answer)
    } catch (error) {
      if (!current()) return
      setMessage(requestErrorMessage(error))
      setPhase('checking')
      try {
        // 응답 유실은 생성 실패가 아니다. 자동 재전송 대신 읽기만 수행한다.
        await client.cancelQueries({ queryKey, exact: true })
        if (!current()) return
        const answer = await client.fetchQuery({ ...options, staleTime: 0 })
        if (current() && answer && answer.status !== 'failed') setMessage(null)
      } catch {
        // 조회 오류는 query 상태로 표시하며 새 생성은 잠근다.
      }
    } finally {
      if (current()) setPhase('idle')
      if (controller.current === attempt) controller.current = null
    }
  }

  async function recheck() {
    const checked = await result.refetch()
    if (
      mounted.current &&
      (!session || isAuthReadSessionCurrent(session)) &&
      !checked.isError &&
      checked.data &&
      checked.data.status !== 'failed'
    )
      setMessage(null)
  }

  return { result, consent, setConsent, phase, message, request, recheck }
}
