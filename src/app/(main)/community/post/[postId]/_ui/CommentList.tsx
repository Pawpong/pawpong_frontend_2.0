'use client'

import { Button, InfiniteScrollTrigger, ListState } from '@/shared/ui'
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
        replyDisabled={thread.isSubmitting}
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
        onRetry={() => void thread.refetch()}
        isRetrying={thread.isFetching}
      >
        {threads.map((item) => (
          <div key={item.parentId}>
            {/* root가 없으면 삭제된 댓글 — 자리만 남기고 답글은 그대로 보여준다 */}
            {item.root ? (
              <CommentItem
                comment={item.root}
                currentUserId={me?.userId}
                onReply={handleReply}
                replyDisabled={thread.isSubmitting}
              />
            ) : (
              <p className="py-3 text-sm font-medium text-text-secondary">삭제된 댓글입니다.</p>
            )}
            {renderReplies(item.replies, item.root !== null)}
          </div>
        ))}
      </ListState>

      {isError && threads.length > 0 && (
        <div className="space-y-2 rounded-xl bg-neutral-50 p-3">
          <p role="alert" className="text-sm leading-relaxed text-neutral-700">
            {thread.isFetchNextPageError
              ? '다음 댓글을 불러오지 못했어요.'
              : '댓글을 최신 상태로 불러오지 못했어요.'}{' '}
            이미 불러온 댓글은 그대로예요.
          </p>
          <Button
            intent="secondary"
            size="sm"
            disabled={thread.isFetching}
            onClick={() => void (thread.isFetchNextPageError ? fetchNextPage() : thread.refetch())}
          >
            {thread.isFetching ? '댓글 확인 중…' : '댓글 다시 불러오기'}
          </Button>
        </div>
      )}
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={!isError && !isPending && (hasNextPage ?? false)}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  )
}

export { CommentList }
