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
            className="flex h-12 min-w-0 flex-1 items-center rounded-full border border-neutral-300 bg-base-white px-5 text-left text-body-md font-medium text-neutral-500 transition-[border-color,box-shadow] duration-150 hover:border-primary-500 focus-visible:border-primary-500 focus-visible:ring-4 focus-visible:ring-point-500/45 focus-visible:outline-none motion-reduce:transition-none pc:h-14 pc:px-6"
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
