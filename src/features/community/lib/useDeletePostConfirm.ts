'use client'

import { useState } from 'react'
import { useDeleteCommunityPost } from '../api/community.mutations'

/**
 * [refactored] 게시글 삭제 확인 모달의 상태·핸들러.
 * 커뮤니티 피드와 마이홈이 같은 코드(대상 id state + mutation + 성공 시 닫기)를
 * 각자 들고 있어 한쪽만 고치면 어긋났다.
 *
 * 삭제 성공 후에만 모달을 닫는다 — 실패하면 모달을 유지해 재시도할 수 있다.
 */
const useDeletePostConfirm = () => {
  const deletePost = useDeleteCommunityPost()
  const [targetId, setTargetId] = useState<string | null>(null)

  const confirm = () => {
    if (!targetId || deletePost.isPending) return
    deletePost.mutate(targetId, { onSuccess: () => setTargetId(null) })
  }

  return {
    /** 카드의 삭제 버튼에 그대로 넘긴다 */
    requestDelete: setTargetId,
    /** DeleteConfirmModal에 펼쳐 넣는다 */
    modalProps: {
      open: targetId !== null,
      onOpenChange: (open: boolean) => !open && setTargetId(null),
      onConfirm: confirm,
      isPending: deletePost.isPending,
    },
  }
}

export { useDeletePostConfirm }
