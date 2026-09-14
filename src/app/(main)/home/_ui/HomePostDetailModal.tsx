'use client'

import { PostDetailDialog } from '../../community/_ui/PostDetailDialog'

interface HomePostDetailModalProps {
  postId: string | null
  onOpenChange: (open: boolean) => void
}

/** 공개 홈과 마이홈의 게시글 그리드가 함께 쓰는 상세 모달. */ // [refactored] 본문은 PostDetailDialog
const HomePostDetailModal = ({ postId, onOpenChange }: HomePostDetailModalProps) => {
  if (!postId) return null
  return <PostDetailDialog postId={postId} onOpenChange={onOpenChange} />
}

export { HomePostDetailModal }
