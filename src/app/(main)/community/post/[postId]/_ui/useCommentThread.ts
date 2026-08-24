'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { useCreateCommunityComment } from '@/features/community'
import { useMe } from '@/features/auth'
import { flattenPages } from '@/shared/lib/infiniteList'
import type { CommunityComment } from '@/shared/types'

/** 최상위 댓글 하나와 그 답글들. root가 null이면 삭제된 댓글 자리. */
interface CommentThread {
  parentId: string
  root: CommunityComment | null
  replies: CommunityComment[]
  createdAt: string
}

/** 로드된 댓글로 1단계 스레드(최상위 + 답글) 구성 */
const buildCommentTree = (comments: CommunityComment[]) => {
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>((acc, c) => {
    if (c.parentCommentId) (acc[c.parentCommentId] ??= []).push(c)
    return acc
  }, {})
  const loadedIds = new Set(comments.map((c) => c.commentId))

  const threads: CommentThread[] = comments
    .filter((c) => !c.parentCommentId)
    .map((root) => ({
      parentId: root.commentId,
      root,
      replies: repliesByParent[root.commentId] ?? [],
      createdAt: root.createdAt,
    }))

  // 댓글은 작성순(asc)이라 답글이 로드됐으면 부모도 로드돼 있다. 그런데도 부모가 없으면 삭제된 것
  // (서버는 소프트 삭제한 댓글을 응답에서 빼버린다) → 답글이 사라지지 않게 '삭제된 댓글' 자리를 만든다.
  Object.entries(repliesByParent).forEach(([parentId, replies]) => {
    if (loadedIds.has(parentId)) return
    threads.push({ parentId, root: null, replies, createdAt: replies[0].createdAt })
  })

  threads.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return { threads, loadedIds }
}

/**
 * 댓글 목록·작성·답글 대상을 한 곳에서 관리한다.
 * 목록(CommentList)과 입력창(CommentComposerBar)이 상세 레이아웃에서 서로 떨어진 자리에
 * 배치되므로, 각자 훅을 부르지 않고 부모가 한 번 호출해 결과를 내려준다.
 */
const useCommentThread = (postId: string) => {
  // [refactored] useAuthStatus + profileQueries.me 조합을 useMe로
  // (상세와 같은 queryKey라 네트워크 요청은 1건으로 합쳐진다)
  const { isLoggedIn, me } = useMe()
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery(communityQueries.comments(postId))
  const createComment = useCreateCommunityComment(postId)

  // 답글 대상 (parentCommentId 는 최상위 댓글로 고정 — 1단계 스레드)
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; nickname: string } | null>(
    null,
  )

  const { threads, loadedIds } = buildCommentTree(flattenPages(commentsData))

  const handleReply = (comment: CommunityComment) => {
    // 답글의 답글도 최상위 댓글에 매달아 1단계 스레드를 유지
    setReplyTarget({
      commentId: comment.parentCommentId ?? comment.commentId,
      nickname: comment.authorNickname,
    })
  }

  const handleSubmitComment = async (body: string) => {
    // 답글 쓰는 사이 대상 댓글이 삭제됐으면 없는 parentCommentId를 보내지 않고 최상위로 작성한다
    const parentCommentId =
      replyTarget && loadedIds.has(replyTarget.commentId) ? replyTarget.commentId : undefined

    await createComment.mutateAsync({ body, parentCommentId })
    setReplyTarget(null)
  }

  return {
    isLoggedIn,
    me,
    threads,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createComment,
    replyTarget,
    cancelReply: () => setReplyTarget(null),
    handleReply,
    handleSubmitComment,
  }
}

type CommentThreadController = ReturnType<typeof useCommentThread>

export { useCommentThread }
export type { CommentThread, CommentThreadController }
