'use client'

import { useState } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import { useCreateCommunityComment } from '@/features/community'
import { useAuthStatus } from '@/features/auth'
import type { CommunityComment } from '@/shared/types'
import { CommentItem } from './CommentItem'
import { CommentComposer } from './CommentComposer'

// [refactored] PostDetailContent에서 옮겨온 순수 함수 — 로드된 댓글로 1단계 스레드(최상위 + 답글) 구성
const buildCommentTree = (comments: CommunityComment[]) => {
  const topLevel = comments.filter((c) => !c.parentCommentId)
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>((acc, c) => {
    if (c.parentCommentId) (acc[c.parentCommentId] ??= []).push(c)
    return acc
  }, {})

  // 댓글은 작성순(asc)이라 답글이 로드됐으면 부모도 로드돼 있다. 그런데도 부모가 없으면 삭제된 것
  // (서버는 소프트 삭제한 댓글을 응답에서 빼버린다) → 답글이 사라지지 않게 '삭제된 댓글' 자리를 만든다.
  const loadedIds = new Set(comments.map((c) => c.commentId))
  const deletedParentIds = Object.keys(repliesByParent).filter((id) => !loadedIds.has(id))

  return { topLevel, repliesByParent, deletedParentIds }
}

interface CommentSectionProps {
  postId: string
}

/** 게시글 상세의 댓글 영역 — 입력창 + 1단계 스레드 + 무한스크롤 */
const CommentSection = ({ postId }: CommentSectionProps) => {
  const { isLoggedIn } = useAuthStatus()
  // 상세와 같은 queryKey라 네트워크 요청은 1건으로 합쳐진다 (prop drilling 대신 직접 조회)
  const { data: me } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })
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

  const comments = commentsData?.pages.flatMap((page) => page.items) ?? []
  const { topLevel, repliesByParent, deletedParentIds } = buildCommentTree(comments)

  const handleReply = (comment: CommunityComment) => {
    // 답글의 답글도 최상위 댓글에 매달아 1단계 스레드를 유지
    setReplyTarget({
      commentId: comment.parentCommentId ?? comment.commentId,
      nickname: comment.authorNickname,
    })
  }

  const handleSubmitComment = async (body: string) => {
    await createComment.mutateAsync({ body, parentCommentId: replyTarget?.commentId })
    setReplyTarget(null)
  }

  // 삭제된 부모 아래 답글은 답글달기를 막는다 — 이미 없는 parentCommentId로 다시 작성하게 된다
  const renderReplies = (parentId: string, canReply = true) =>
    (repliesByParent[parentId] ?? []).map((reply) => (
      <CommentItem
        key={reply.commentId}
        comment={reply}
        currentUserId={me?.userId}
        onReply={canReply ? handleReply : undefined}
        isReply
      />
    ))

  return (
    <>
      {/* 댓글 입력 (로그인 사용자만) */}
      {isLoggedIn && (
        <CommentComposer
          onSubmit={handleSubmitComment}
          isSubmitting={createComment.isPending}
          hasSubmitError={createComment.isError}
          onClearSubmitError={createComment.reset}
          profileImageUrl={me?.profileImageUrl}
          replyingToNickname={replyTarget?.nickname}
          onCancelReply={() => setReplyTarget(null)}
        />
      )}

      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={topLevel.length === 0 && deletedParentIds.length === 0}
        loadingText="댓글을 불러오는 중입니다."
        errorText="댓글을 불러오지 못했습니다."
        emptyText="첫 댓글을 남겨보세요."
      >
        {topLevel.map((comment) => (
          <div key={comment.commentId}>
            <CommentItem comment={comment} currentUserId={me?.userId} onReply={handleReply} />
            {renderReplies(comment.commentId)}
          </div>
        ))}

        {/* 삭제된 댓글에 달려 있던 답글 — 자리만 남기고 답글은 그대로 보여준다 */}
        {deletedParentIds.map((parentId) => (
          <div key={parentId}>
            <p className="py-3 text-sm font-medium text-text-secondary">삭제된 댓글입니다.</p>
            {renderReplies(parentId, false)}
          </div>
        ))}
      </ListState>

      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  )
}

export { CommentSection }
