'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import {
  useCreateCommunityComment,
  nextCommunityCreateAttempt,
  type CommunityCreateAttempt,
} from '@/features/community'
import { useLoginGuard, useMe } from '@/features/auth'
import { ApiError } from '@/shared/api'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import { isAuthReadSessionCurrent } from '@/shared/lib/authReadSession'
import { flattenPages } from '@/shared/lib/infiniteList'
import type { CommunityComment } from '@/shared/types'
import { buildCommentTree, CommentIntentError, type CommentReplyTarget } from './commentThread'

const useCommentThread = (postId: string, enabled = true) => {
  const { isLoggedIn, me: profile } = useMe()
  const login = useLoginGuard()
  const session = useAuthReadSession()
  const composerKey = JSON.stringify([postId, session?.scope])
  const currentContext = useRef<string | null>(composerKey)
  useLayoutEffect(() => {
    currentContext.current = composerKey
    return () => {
      currentContext.current = null
    }
  }, [composerKey])
  const [draft, setDraft] = useState<{ key: string; value: string } | null>(null)
  const commentBody = draft?.key === composerKey ? draft.value : ''
  const setCommentBody = (value: string) => {
    if (currentContext.current === composerKey) setDraft({ key: composerKey, value })
  }
  const me =
    session?.identity === JSON.stringify([profile?.role, profile?.userId]) ? profile : undefined
  const query = useInfiniteQuery({
    ...communityQueries.comments(postId, 20, session),
    enabled,
    retry: false,
    throwOnError: false,
  })
  const createComment = useCreateCommunityComment(postId, session)
  const [reply, setReply] = useState<{ key: string; target: CommentReplyTarget } | null>(null)
  const [sendingKey, setSendingKey] = useState<string | null>(null)
  const inFlight = useRef<{ key: string } | null>(null)
  const retryAttempt = useRef<CommunityCreateAttempt | null>(null)
  const replyTarget = reply?.key === composerKey ? reply.target : null
  const isSubmitting = sendingKey === composerKey || createComment.isPending
  const busy = () => inFlight.current?.key === composerKey || isSubmitting
  const { threads, loadedIds } = buildCommentTree(flattenPages(query.data))

  const handleReply = (comment: CommunityComment) => {
    if (!enabled || busy()) return
    if (!isLoggedIn || !session) return login.openPrompt()
    setReply({
      key: composerKey,
      target: {
        commentId: comment.parentCommentId ?? comment.commentId,
        nickname: comment.authorNickname,
      },
    })
  }
  const cancelReply = () => {
    if (!busy()) setReply(null)
  }
  const handleSubmitComment = async (body: string) => {
    if (!enabled) throw new CommentIntentError('공개 보류 중에는 댓글을 작성할 수 없어요.')
    if (!session || !isAuthReadSessionCurrent(session))
      throw new ApiError('로그인 상태가 변경되었습니다.', 401)
    if (busy()) throw new CommentIntentError('댓글을 게시하고 있어요. 잠시 기다려 주세요.')
    if (replyTarget && (query.isPending || query.isError))
      throw new CommentIntentError('댓글 목록을 다시 확인한 뒤 답글을 게시해 주세요.')
    if (replyTarget && !loadedIds.has(replyTarget.commentId))
      throw new CommentIntentError(
        '답글 대상을 확인할 수 없어요. 댓글 목록을 다시 확인하거나 답글을 취소해 주세요.',
      )
    const attempt = { key: composerKey }
    const request = nextCommunityCreateAttempt(
      retryAttempt.current,
      JSON.stringify([composerKey, body.trim(), replyTarget?.commentId ?? null]),
    )
    retryAttempt.current = request
    inFlight.current = attempt
    setSendingKey(composerKey)
    try {
      await createComment.mutateAsync({
        body,
        parentCommentId: replyTarget?.commentId,
        clientRequestId: request.clientRequestId,
      })
      if (!isAuthReadSessionCurrent(session) || currentContext.current !== composerKey)
        throw new ApiError('로그인 상태가 변경되었습니다.', 401)
      if (retryAttempt.current === request) retryAttempt.current = null
      setReply((current) => (current === reply ? null : current))
    } finally {
      if (inFlight.current === attempt) {
        inFlight.current = null
        setSendingKey(null)
      }
    }
  }

  return {
    isLoggedIn: isLoggedIn && Boolean(session),
    me,
    login,
    composerKey,
    commentBody,
    setCommentBody,
    threads,
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
    isFetchNextPageError: query.isFetchNextPageError,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    createComment,
    isSubmitting,
    replyTarget,
    cancelReply,
    handleReply,
    handleSubmitComment,
  }
}

type CommentThreadController = ReturnType<typeof useCommentThread>
export { useCommentThread }
export type { CommentThreadController }
export type { CommentThread } from './commentThread'
