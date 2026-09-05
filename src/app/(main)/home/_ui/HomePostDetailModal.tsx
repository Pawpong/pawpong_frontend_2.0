'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailPanel } from '../../community/_ui/PostDetailPanel'

interface HomePostDetailModalProps {
  postId: string | null
  onOpenChange: (open: boolean) => void
}

/** 공개 홈과 마이홈의 게시글 그리드가 함께 쓰는 반응형 상세 모달. */
const HomePostDetailModal = ({ postId, onOpenChange }: HomePostDetailModalProps) => {
  const isPc = useBreakpoint('pc')

  if (!postId) return null

  return (
    <DialogPrimitive.Root open onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-modal flex h-[68.75rem] max-h-[calc(100dvh-2rem)] w-[26.25rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white pc:h-[42.5rem] pc:w-[70rem] pc:max-w-[calc(100vw-2rem)]"
        >
          <DialogPrimitive.Title className="sr-only">게시글 상세</DialogPrimitive.Title>
          <PostDetailPanel
            postId={postId}
            layout={isPc ? 'side-by-side' : 'stacked'}
            trailingAction={
              <DialogPrimitive.Close
                aria-label="닫기"
                className="shrink-0 text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <CloseIcon className="size-6" />
              </DialogPrimitive.Close>
            }
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { HomePostDetailModal }
