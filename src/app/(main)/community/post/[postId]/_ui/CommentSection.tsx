'use client'

import { CommentList } from './CommentList'
import { CommentComposerBar } from './CommentComposerBar'
import { useCommentThread } from './useCommentThread'

interface CommentSectionProps {
  postId: string
}

/**
 * 목록 + 입력창을 세로로 이어 붙인 기본 배치 — 상세 풀페이지(tab·pc)에서 쓴다.
 * 모달·모바일처럼 입력창을 하단에 고정해야 하는 곳은 useCommentThread를 직접 호출해
 * CommentList / CommentComposerBar를 각자 원하는 자리에 배치한다.
 */
const CommentSection = ({ postId }: CommentSectionProps) => {
  const thread = useCommentThread(postId)

  return (
    <>
      <CommentList thread={thread} />
      <CommentComposerBar thread={thread} />
    </>
  )
}

export { CommentSection }
