'use client'

import { MediaDialog } from '@/shared/ui'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailPanel } from './PostDetailPanel'

interface PostDetailDialogProps {
  postId: string
  onOpenChange: (open: boolean) => void
  mobileFullScreen?: boolean
}

// [refactored] 커뮤니티 인터셉트 모달과 홈 그리드 모달이 같은 본문을 복제하고 있었다.
// 여는 조건·닫기 동작만 호출부가 정하고, 표면과 레이아웃 분기는 여기서 한 번만.
const PostDetailDialog = ({
  postId,
  onOpenChange,
  mobileFullScreen = false,
}: PostDetailDialogProps) => {
  const isLapUp = useBreakpoint('lap')

  return (
    <MediaDialog
      open
      onOpenChange={onOpenChange}
      title="게시글"
      className={
        mobileFullScreen
          ? 'h-dvh w-screen max-w-none rounded-none border-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] tab:h-[min(44rem,calc(100dvh-2rem))] tab:w-[calc(100vw-2rem)] tab:max-w-6xl tab:rounded-2xl tab:border tab:p-0'
          : 'max-w-6xl'
      }
    >
      <PostDetailPanel postId={postId} layout={isLapUp ? 'side-by-side' : 'stacked'} />
    </MediaDialog>
  )
}

export { PostDetailDialog }
