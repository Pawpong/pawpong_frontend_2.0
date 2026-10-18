'use client'

import { useRouter } from 'next/navigation'
import { PostDetailDialog } from '../../../../_ui/PostDetailDialog'

interface PostDetailModalProps {
  postId: string
}

/** 목록을 유지한 채 모바일은 전체 화면, 큰 화면은 대화상자로 상세를 연다. */
const PostDetailModal = ({ postId }: PostDetailModalProps) => {
  const router = useRouter()
  return (
    <PostDetailDialog
      postId={postId}
      mobileFullScreen
      onOpenChange={(open) => !open && router.back()}
    />
  )
}

export { PostDetailModal }
