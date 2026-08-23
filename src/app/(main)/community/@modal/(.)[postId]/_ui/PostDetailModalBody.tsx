'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets/icons'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailPanel } from '../../../_ui/PostDetailPanel'

interface PostDetailModalBodyProps {
  postId: string
}

/**
 * 최은진: Figma "feed-detail" 컴포넌트(node 3753:246802, device=pc·device=tab-mo)를
 * 그대로 반영하도록 전면 재작성 — 실제 마크업은 PostDetailPanel(공용)이 그리고, 이
 * 파일은 pc/tab 브레이크포인트에 맞는 layout과 "닫기(X)" 트레일링 아이콘만 결정한다.
 * https://www.figma.com/design/7VXGIjqr1eZBEmsp3OPNie/2026-pawpong?node-id=3753-246802
 *
 * 최은진: 기존엔 stacked→side-by-side 전환 기준이 tab(768~)이라 tab 폭에서도 이미
 * 사이드바이사이드로 보였다. Figma device=pc 베리언트는 pc(1440~)에서만 쓰고,
 * tab(768~1439)은 device=tab-mo(스택형)를 그대로 모달로 띄운다.
 *
 * 최은진: 닫기(X)가 기존엔 이미지 위에 떠 있는 절대위치 버튼(PostDetailModal)이었는데,
 * Figma 헤더 안에 X가 포함돼 있어 PostDetailPanel의 header trailing 슬롯으로 옮겼다.
 * DialogPrimitive.Close는 같은 Dialog.Root 트리 안이면 어디서 렌더해도 동작한다.
 */
const PostDetailModalBody = ({ postId }: PostDetailModalBodyProps) => {
  const isPc = useBreakpoint('pc')

  const closeButton = (
    <DialogPrimitive.Close
      aria-label="닫기"
      className="shrink-0 rounded-full p-1 text-text-primary hover:bg-fill-muted focus:outline-none"
    >
      <CloseIcon className="size-6" />
    </DialogPrimitive.Close>
  )

  return (
    <PostDetailPanel
      postId={postId}
      layout={isPc ? 'side-by-side' : 'stacked'}
      trailingAction={closeButton}
    />
  )
}

export { PostDetailModalBody }
