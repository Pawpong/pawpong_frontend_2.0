'use client'

import { Button, Input, LoginPromptModal } from '@/shared/ui'
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
        // 로그인 상태와 같은 입력칸을 보여 주고, 누르면 로그인 안내를 띄운다 (유튜브·인스타그램 방식)
        <CommentComposerShell>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Input
              readOnly
              onClick={openPrompt}
              aria-label="댓글 입력 — 로그인이 필요해요"
              placeholder="로그인하고 댓글을 남겨보세요"
              className="min-w-0 flex-1 cursor-pointer"
            />
            <div className="flex min-w-14 shrink-0">
              <Button size="md" width="full" onClick={openPrompt}>
                게시
              </Button>
            </div>
          </div>
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
