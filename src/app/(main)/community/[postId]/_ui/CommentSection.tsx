'use client'

import { useState } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import { useCreateCommunityComment } from '@/features/community'
import { useAuthStatus } from '@/features/auth'
import type { CommunityComment } from '@/shared/types'
import { MOCK_ME } from '../../_ui/mockFeed'
import { CommentItem } from './CommentItem'
import { CommentComposer } from './CommentComposer'
import { flattenPages } from '@/shared/lib/infiniteList'

/** 최상위 댓글 하나와 그 답글들. root가 null이면 삭제된 댓글 자리. */
interface CommentThread {
  parentId: string
  root: CommunityComment | null
  replies: CommunityComment[]
  createdAt: string
}

// [refactored] PostDetailContent에서 옮겨온 순수 함수 — 로드된 댓글로 1단계 스레드(최상위 + 답글) 구성
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
  // 자리의 시각은 첫 답글 기준 — 삭제 스레드가 목록 끝으로 밀리지 않고 원래 맥락에 남는다.
  Object.entries(repliesByParent).forEach(([parentId, replies]) => {
    if (loadedIds.has(parentId)) return
    threads.push({ parentId, root: null, replies, createdAt: replies[0].createdAt })
  })

  threads.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return { threads, loadedIds }
}

interface CommentSectionProps {
  postId: string
}

/** 게시글 상세의 댓글 영역 — 입력창 + 1단계 스레드 + 무한스크롤 */
const CommentSection = ({ postId }: CommentSectionProps) => {
  const { isLoggedIn } = useAuthStatus()
  // 상세와 같은 queryKey라 네트워크 요청은 1건으로 합쳐진다 (prop drilling 대신 직접 조회)
  const { data: fetchedMe } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })
  // mock-* 글(백엔드 없는 로컬 미리보기)에 한해, 로그인 여부와 무관하게 가짜 프로필로
  // 댓글 작성 인터랙션을 미리 볼 수 있게 한다. 실제 게시글은 기존처럼 로그인이 있어야 댓글창이 뜬다.
  const isMockPost = postId.startsWith('mock-')
  const me = fetchedMe ?? (isMockPost ? MOCK_ME : undefined)
  const showComposer = isLoggedIn || isMockPost
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

  const comments = flattenPages(commentsData)
  const { threads, loadedIds } = buildCommentTree(comments)

  const handleReply = (comment: CommunityComment) => {
    // 답글의 답글도 최상위 댓글에 매달아 1단계 스레드를 유지
    setReplyTarget({
      commentId: comment.parentCommentId ?? comment.commentId,
      nickname: comment.authorNickname,
    })
  }

  const handleSubmitComment = async (body: string) => {
    // 답글 쓰는 사이 대상 댓글이 삭제됐으면 없는 parentCommentId를 보내지 않고 최상위 댓글로 작성한다
    const parentCommentId =
      replyTarget && loadedIds.has(replyTarget.commentId) ? replyTarget.commentId : undefined

    await createComment.mutateAsync({
      body,
      parentCommentId,
      // 있으면(로그인 상태) 응답을 기다리지 않고 입력창 바로 아래에 낙관적으로 먼저 그린다
      optimisticAuthor: me
        ? {
            authorId: me.userId,
            authorModel: me.role === 'breeder' ? 'Breeder' : 'Adopter',
            authorNickname: me.nickname,
            authorProfileImageUrl: me.profileImageUrl,
          }
        : undefined,
    })
    setReplyTarget(null)
  }

  // 삭제된 부모 아래 답글은 답글달기를 막는다 — 이미 없는 parentCommentId로 다시 작성하게 된다
  const renderReplies = (replies: CommunityComment[], canReply: boolean) =>
    replies.map((reply) => (
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
      {/* 댓글 입력 — 로그인 사용자, 또는 mock 글 미리보기 */}
      {showComposer && (
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
        isEmpty={threads.length === 0}
        loadingText="댓글을 불러오는 중입니다."
        errorText="댓글을 불러오지 못했습니다."
        emptyText="첫 댓글을 남겨보세요."
      >
        {threads.map((thread) => (
          <div key={thread.parentId}>
            {/* root가 없으면 삭제된 댓글 — 자리만 남기고 답글은 그대로 보여준다 */}
            {thread.root ? (
              <CommentItem comment={thread.root} currentUserId={me?.userId} onReply={handleReply} />
            ) : (
              <p className="py-3 text-sm font-medium text-text-secondary">삭제된 댓글입니다.</p>
            )}
            {renderReplies(thread.replies, thread.root !== null)}
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
