'use client'

import { Button, LoginPromptModal } from '@/shared/ui'
import { COMMUNITY_LOGIN_PROMPT } from '@/entities/community'
import { CommentComposer } from './CommentComposer'
import { CommentComposerShell } from './CommentComposerShell'
import type { CommentThreadController } from './useCommentThread'

interface CommentComposerBarProps {
  thread: CommentThreadController
  className?: string
}

/**
 * 댓글 입력창 — 상세 모달·모바일 페이지에서는 하단에 고정해 목록을 스크롤해도 항상 닿게 한다.
 * 비로그인은 요청이 401로 떨어지므로 입력창 대신 로그인 유도를 보여준다.
 */
const CommentComposerBar = ({ thread, className }: CommentComposerBarProps) => {
  const { isLoggedIn, me, createComment, replyTarget, cancelReply, handleSubmitComment } = thread
  const { openPrompt, isPromptOpen, setPromptOpen } = thread.login

  return (
    <div className={className}>
      {isLoggedIn ? (
        <CommentComposer
          key={thread.composerKey}
          draft={thread.commentBody}
          onDraftChange={thread.setCommentBody}
          onSubmit={handleSubmitComment}
          isSubmitting={thread.isSubmitting}
          hasSubmitError={createComment.isError}
          submitError={createComment.error}
          onClearSubmitError={createComment.reset}
          profileImageUrl={me?.profileImageUrl}
          replyingToNickname={replyTarget?.nickname}
          onCancelReply={cancelReply}
          onCheckComments={() => void thread.refetch()}
          isCheckingComments={thread.isFetching}
        />
      ) : (
        // [refactored] 마크업 복제 대신 CommentComposer와 같은 Shell을 공유한다
        <CommentComposerShell>
          <Button intent="secondary" size="md" width="full" onClick={openPrompt}>
            로그인하고 댓글을 남겨보세요
          </Button>
        </CommentComposerShell>
      )}

      <LoginPromptModal
        open={isPromptOpen}
        onOpenChange={setPromptOpen}
        description={COMMUNITY_LOGIN_PROMPT.comment} // [refactored]
      />
    </div>
  )
}

export { CommentComposerBar }
