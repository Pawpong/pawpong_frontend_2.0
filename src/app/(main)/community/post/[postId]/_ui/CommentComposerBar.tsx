'use client'

import { LoginPromptModal } from '@/shared/ui'
import { COMMUNITY_LOGIN_PROMPT } from '@/entities/community'
import { useLoginGuard } from '@/features/auth'
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
  const { openPrompt, isPromptOpen, setPromptOpen } = useLoginGuard()

  return (
    <div className={className}>
      {isLoggedIn ? (
        <CommentComposer
          onSubmit={handleSubmitComment}
          isSubmitting={createComment.isPending}
          hasSubmitError={createComment.isError}
          onClearSubmitError={createComment.reset}
          profileImageUrl={me?.profileImageUrl}
          replyingToNickname={replyTarget?.nickname}
          onCancelReply={cancelReply}
        />
      ) : (
        // [refactored] 마크업 복제 대신 CommentComposer와 같은 Shell을 공유한다
        <CommentComposerShell>
          <button
            type="button"
            onClick={openPrompt}
            className="flex h-14 min-w-0 flex-1 items-center rounded-lg border border-neutral-500 bg-white px-3 text-left text-base leading-[1.5] font-medium text-neutral-500 transition-[border-color,background-color] hover:border-primary-500 hover:bg-point-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            로그인하고 댓글을 남겨보세요
          </button>
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
