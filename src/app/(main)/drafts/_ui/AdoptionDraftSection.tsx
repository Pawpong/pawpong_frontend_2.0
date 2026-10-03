'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DeleteConfirmModal, Separator } from '@/shared/ui'
import { PetPostingDraftCard, petPostingQueries } from '@/entities/pet-posting'
import { useDeletePetPostingDraft } from '@/features/pet-posting'
import { DraftSection } from './DraftSection'

/** 임시저장 카드를 누르면 작성 화면에서 이어서 쓴다 */
const AdoptionDraftSection = () => {
  const {
    data,
    isPending,
    isError,
    refetch,
    isFetching: isRetrying,
  } = useQuery({
    ...petPostingQueries.drafts(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const drafts = data ?? []

  const deleteDraft = useDeletePetPostingDraft()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 삭제 성공 후에만 모달을 닫는다 (실패하면 모달을 유지해 재시도 가능)
  const handleDelete = () => {
    if (!deleteTargetId || deleteDraft.isPending) return
    deleteDraft.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
  }

  return (
    <>
      {/* [refactored] 제목·개수·목록 상태는 DraftSection 골격으로 */}
      <DraftSection
        title="분양글"
        count={drafts.length}
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
        isRetrying={isRetrying}
        loadingText="임시저장한 분양글을 불러오는 중입니다."
        errorText="임시저장한 분양글을 불러오지 못했습니다."
        emptyText="임시저장한 분양글이 없습니다."
      >
        <ul className="overflow-hidden rounded-xl border border-neutral-150 bg-white">
          {drafts.map((draft, index) => (
            <li key={draft.draftId}>
              {index > 0 && <Separator className="mx-3 bg-neutral-150 tab:mx-5" />}
              <PetPostingDraftCard
                draft={draft}
                onDelete={() => setDeleteTargetId(draft.draftId)}
              />
            </li>
          ))}
        </ul>
      </DraftSection>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        target="임시저장 분양글"
        onConfirm={handleDelete}
        isPending={deleteDraft.isPending}
      />
    </>
  )
}

export { AdoptionDraftSection }
