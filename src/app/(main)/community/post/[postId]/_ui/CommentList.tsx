'use client'

import { usePublicActivityBadges } from '@/features/gamification'
import { Button, DeleteConfirmModal, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { CommentItem } from './CommentItem'
import type { CommentThreadController } from './useCommentThread'
import { CommentEditForm } from './CommentEditForm'
import { CommentActionFeedback } from './CommentActionFeedback'

interface CommentListProps {
  thread: CommentThreadController
}

/** 1단계 스레드 목록 + 무한스크롤. 입력창은 CommentComposerBar가 따로 담당한다. */
const CommentList = ({ thread }: CommentListProps) => {
  const {
    actions,
    threads,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleReply,
  } = thread

  const authors = threads.flatMap((item) => [...(item.root ? [item.root] : []), ...item.replies])
  const levels = usePublicActivityBadges(
    authors.map((comment) => ({
      ownerId: comment.authorId,
      role: comment.authorModel === 'Breeder' ? 'breeder' : 'adopter',
    })),
  )
  const levelFor = (comment: CommunityComment) =>
    levels.find(
      (owner) =>
        owner.ownerId === comment.authorId &&
        owner.role === (comment.authorModel === 'Breeder' ? 'breeder' : 'adopter'),
    )?.level

  // 삭제된 부모 아래 답글은 답글달기를 막는다 — 이미 없는 parentCommentId로 다시 작성하게 된다
  const renderReplies = (replies: CommunityComment[], canReply: boolean) =>
    replies.map((reply) => (
      <CommentItem
        key={reply.commentId}
        comment={reply}
        level={levelFor(reply)}
        actions={actions}
        onReply={canReply ? handleReply : undefined}
        replyDisabled={thread.isSubmitting}
        isReply
      />
    ))

  return (
    <>
      <CommentActionFeedback notice={actions.notice} />
      {actions.active?.mode === 'edit' &&
        (isPending ||
          !threads.some(
            (item) =>
              item.root?.commentId === actions.active?.comment.commentId ||
              item.replies.some((reply) => reply.commentId === actions.active?.comment.commentId),
          )) && (
          <section className="mb-3 rounded-xl border border-neutral-200 p-3">
            <p className="text-sm font-semibold">수정 중인 댓글</p>
            <p className="mt-1 text-xs text-neutral-600">
              목록을 확인하는 동안에도 입력한 내용은 유지돼요.
            </p>
            <CommentEditForm actions={actions} />
          </section>
        )}
      <DeleteConfirmModal
        open={actions.active?.mode === 'delete'}
        target="댓글"
        onOpenChange={(open) => {
          if (!open) actions.cancel()
        }}
        onConfirm={() => void actions.submit()}
        isPending={actions.isBusy && !actions.isChecking}
        isChecking={actions.isChecking}
        errorMessage={actions.active?.mode === 'delete' ? actions.active.error : undefined}
        onCheck={
          actions.active?.mode === 'delete' && actions.active.error
            ? () => void actions.recheck()
            : undefined
        }
      />
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={threads.length === 0}
        loadingText="댓글을 불러오는 중이에요."
        errorText="댓글을 불러오지 못했어요."
        emptyText="첫 댓글을 남겨보세요."
        onRetry={() => void thread.refetch()}
        isRetrying={thread.isFetching}
      >
        {threads.map((item) => (
          <div key={item.parentId}>
            {/* root가 없으면 삭제된 댓글 — 자리만 남기고 답글은 그대로 보여준다 */}
            {item.root ? (
              <CommentItem
                level={levelFor(item.root)}
                comment={item.root}
                actions={actions}
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
