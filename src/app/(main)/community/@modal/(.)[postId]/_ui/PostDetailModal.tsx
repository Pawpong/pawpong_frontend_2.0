'use client'

import { useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailModalBody } from './PostDetailModalBody'

interface PostDetailModalProps {
  postId: string
}

/**
 * 최은진: 신규 파일 — 인터셉트 라우트(page.tsx)에서 렌더되는 모달 셸.
 * 인스타그램 웹의 댓글 아이콘 클릭 로직: 피드는 그대로 뒤에 남겨두고 상세를 큰 모달로 띄운다.
 * 닫으면(X 버튼·바깥 클릭·ESC 모두 onOpenChange로 들어온다) 오던 자리로 돌아간다.
 *
 * 공용 Dialog(shared/ui)를 안 쓰고 radix primitive를 직접 쓰는 이유: 공용 Dialog는 z-50 고정인데
 * 사이트 상단 헤더(<header>)도 sticky z-50이라 겹치면 배경이 어두워지지 않는 스태킹 충돌이 있었다.
 * 이 파일은 community 페이지 전용이라 여기서만 z를 더 높여 해결한다 (공용 컴포넌트는 건드리지 않음).
 *
 * 최은진: 반응형 정책(참고: 바탕화면 pawpong/FeedDetailModal) 반영 — pc(1440~)·tab(768~1439)은
 * 이 모달로 보여주고, mo(~767)는 모달이 아니라 실제 상세 페이지로 이동시킨다. useBreakpoint('tab')
 * 이 false(=mo)로 확정되는 순간 실제 라우트([postId]/page.tsx)로 보내고, 그 판정이 끝나기 전과
 * mo로 확정된 뒤에는 모달을 그리지 않아 깜빡임 없이 페이지만 보이게 한다.
 *
 * 최은진: 처음엔 router.replace를 썼는데, 인터셉트 라우트는 소프트 네비게이션으로
 * "이미 그 경로에 와 있는" 상태이기 때문에 같은 경로로 다시 router.replace를 호출해도
 * Next.js가 인터셉트 렌더를 그대로 유지해버려(=클릭해도 아무 반응이 없는 것처럼 보임) mo에서
 * 피드 상세로 안 넘어가는 버그가 있었다. window.location.replace로 하드 네비게이션을 강제해서
 * 확실히 실제 페이지가 뜨도록 고쳤다.
 *
 * 최은진: 닫기(X) 버튼을 Figma 컴포넌트(node 3753:246802)대로 PostDetailModalBody의 헤더
 * 안으로 옮겨서, 여기 있던 이미지 위 절대위치 X 버튼은 제거했다(중복 방지).
 */
const PostDetailModal = ({ postId }: PostDetailModalProps) => {
  const router = useRouter()
  const isTabUp = useBreakpoint('tab')

  useEffect(() => {
    if (!isTabUp) window.location.replace(`/community/${postId}`)
  }, [isTabUp, postId])

  if (!isTabUp) return null

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && router.back()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        {/* 최은진: Figma "feed-detail" 컴포넌트(node 3753:246802)의 device=tab-mo 베리언트가
            420×1100(가로:세로 ≈ 1:2.62)로, 기존에 쓰던 1:1.2 비율(다른 참고 프로젝트 기준)과
            전혀 다른 세로로 긴 카드 형태다 — 이 새 Figma 스펙에 맞춰 tab 모달 크기를 폭
            26.25rem(420px)·높이 68.75rem(1100px) 고정으로 교체했다(뷰포트 폭 비례 확장이던
            calc(27rem+22vw) 계산식은 폐기). max-h-[85vh]는 1100px가 실제 화면보다 클 때 잘라주는
            안전판 — 댓글 영역(PostDetailPanel의 overflow-y-auto)이 남는 공간을 스크롤로 흡수한다.
            최은진: pc는 예전엔 "device=pc(1120×680)와 비율이 같다"고 보고 뷰포트에 맞춰 크게
            키운 크기(94vh/80rem)를 그대로 뒀었는데, 최신 Figma 섹션(node 3349:2149847 →
            3841:296874, device=pc)을 다시 열어보니 실제로는 비율만 같은 게 아니라 1120×680
            고정 크기 그 자체였다 — 폭 70rem(1120px)·높이 42.5rem(680px) 고정으로 정정. */}
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-[60] flex h-[68.75rem] max-h-[85vh] w-[26.25rem] max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-lg data-[state=closed]:opacity-0 data-[state=open]:opacity-100 pc:h-[42.5rem] pc:max-h-[calc(100vh-1.5rem)] pc:w-[70rem] pc:max-w-[calc(100%-1.5rem)]">
          <DialogPrimitive.Title className="sr-only">게시글 상세</DialogPrimitive.Title>
          <PostDetailModalBody postId={postId} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { PostDetailModal }
