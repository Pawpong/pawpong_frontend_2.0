'use client'

import { useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets'
import { BREAKPOINTS, useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailPanel } from '../../../../_ui/PostDetailPanel'

interface PostDetailModalProps {
  postId: string
}

/**
 * 인터셉트 라우트에서 렌더되는 상세 모달 — 피드는 뒤에 남겨두고 상세만 띄운다.
 *
 * shared/ui의 Dialog가 아니라 Radix primitive를 직접 쓰는 이유: 상세 전용 크기와 레이아웃이 필요하다.
 * 레이어 순서는 전역 z-index 토큰(modal → dropdown → confirm)을 따른다.
 *
 * mo(~767)는 모달 대신 실제 상세 페이지로 보낸다. 인터셉트 라우트는 이미 그 경로에 있는
 * 상태라 router.replace로는 인터셉트 렌더가 유지돼버려, 하드 네비게이션으로 강제한다.
 *
 * 이 판정만 useBreakpoint가 아니라 matchMedia를 직접 읽는다. useBreakpoint는 서버 스냅샷이
 * false여서 하이드레이션 첫 커밋에서는 데스크탑도 false로 보이는데, 그 값으로 곧장 하드
 * 네비게이션을 하면 뷰포트와 무관하게 항상 페이지로 튕겨 모달이 뜨지 않는다.
 */
const PostDetailModal = ({ postId }: PostDetailModalProps) => {
  const router = useRouter()
  const isTabUp = useBreakpoint('tab')
  const isPc = useBreakpoint('pc')

  useEffect(() => {
    if (!window.matchMedia(`(min-width: ${BREAKPOINTS.tab}px)`).matches) {
      window.location.replace(`/community/post/${postId}`)
    }
  }, [postId])

  if (!isTabUp) return null

  const closeButton = (
    <DialogPrimitive.Close
      aria-label="닫기"
      className="shrink-0 rounded-full p-1 text-neutral-850 hover:bg-fill-muted focus:outline-none"
    >
      <CloseIcon className="size-6" />
    </DialogPrimitive.Close>
  )

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && router.back()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        {/* tab은 Figma device=tab-mo(420x1100) 고정, pc는 device=pc(1120x680, 60/40 분할).
            max-h는 1100px가 화면보다 클 때의 안전판 — 남는 높이는 댓글 영역이 스크롤로 흡수한다 */}
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-modal flex h-[68.75rem] max-h-[85vh] w-[26.25rem] max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-lg data-[state=closed]:opacity-0 data-[state=open]:opacity-100 pc:h-[94vh] pc:max-h-[60rem] pc:w-[calc(100%-1.5rem)] pc:max-w-[80rem]">
          <DialogPrimitive.Title className="sr-only">게시글 상세</DialogPrimitive.Title>
          <PostDetailPanel
            postId={postId}
            layout={isPc ? 'side-by-side' : 'stacked'}
            trailingAction={closeButton}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { PostDetailModal }
