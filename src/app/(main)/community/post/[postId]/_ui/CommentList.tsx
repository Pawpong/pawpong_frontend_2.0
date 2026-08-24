'use client'

import { InfiniteScrollTrigger, ListState } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { CommentItem } from './CommentItem'
import type { CommentThreadController } from './useCommentThread'

interface CommentListProps {
  thread: CommentThreadController
}

/** 1단계 스레드 목록 + 무한스크롤. 입력창은 CommentComposerBar가 따로 담당한다. */
const CommentList = ({ thread }: CommentListProps) => {
  const {
    me,
    threads,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleReply,
  } = thread

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
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={threads.length === 0}
        loadingText="댓글을 불러오는 중입니다."
        errorText="댓글을 불러오지 못했습니다."
        emptyText="첫 댓글을 남겨보세요."
      >
        {threads.map((item) => (
          <div key={item.parentId}>
            {/* root가 없으면 삭제된 댓글 — 자리만 남기고 답글은 그대로 보여준다 */}
            {item.root ? (
              <CommentItem comment={item.root} currentUserId={me?.userId} onReply={handleReply} />
            ) : (
              <p className="py-3 text-sm font-medium text-text-secondary">삭제된 댓글입니다.</p>
            )}
            {renderReplies(item.replies, item.root !== null)}
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

export { CommentList }
