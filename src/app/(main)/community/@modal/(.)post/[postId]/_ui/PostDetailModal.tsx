'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BREAKPOINTS, useBreakpoint } from '@/shared/lib/useBreakpoint'
import { PostDetailDialog } from '../../../../_ui/PostDetailDialog'

interface PostDetailModalProps {
  postId: string
}

/**
 * 인터셉트 라우트에서 렌더되는 상세 모달 — 피드는 뒤에 남겨두고 상세만 띄운다.
 *
 * 본문은 홈 그리드 모달과 공유하는 PostDetailDialog. 여기서는 닫기(router.back)와 mo 리다이렉트만.
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

  useEffect(() => {
    if (!window.matchMedia(`(min-width: ${BREAKPOINTS.tab}px)`).matches) {
      window.location.replace(`/community/post/${postId}`)
    }
  }, [postId])

  if (!isTabUp) return null

  // [refactored] 본문 복제 제거
  return <PostDetailDialog postId={postId} onOpenChange={(open) => !open && router.back()} />
}

export { PostDetailModal }
