'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container, DeleteConfirmModal, NavigationBar } from '@/shared/ui'
import { petPostingQueries } from '@/entities/pet-posting'
import { useDeletePetPostingDraft } from '@/features/pet-posting'

/** 임시저장 카드를 누르면 작성 화면에서 이어서 쓴다 */
const AdoptionDraftsContent = () => {
  const router = useRouter()
  const { data } = useQuery(petPostingQueries.drafts())
  const drafts = data ?? []

  const deleteDraft = useDeletePetPostingDraft()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 삭제 성공 후에만 모달을 닫는다 (실패하면 모달을 유지해 재시도 가능)
  const handleDelete = () => {
    if (!deleteTargetId || deleteDraft.isPending) return
    deleteDraft.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="임시저장" backHref="/adoption/my-listings" />

      <Container className="px-4 pb-10 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          {drafts.length === 0 ? (
            <p className="py-10 text-center text-sm leading-[1.5] font-medium text-neutral-700">
              임시저장한 분양글이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {drafts.map((draft) => (
                <li key={draft.draftId}>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-300 p-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/adoption/create?draftId=${draft.draftId}`)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                        {draft.primaryPhotoUrl && (
                          <Image
                            src={draft.primaryPhotoUrl}
                            alt={draft.name || '임시저장 분양글'}
                            fill
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        {/* 임시저장은 이름조차 비어 있을 수 있다 */}
                        <span className="truncate text-sm font-semibold text-neutral-850">
                          {draft.name || '(제목 없음)'}
                        </span>
                        <span className="truncate text-xs font-medium text-neutral-700">
                          {draft.breed || '품종 미입력'}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(draft.draftId)}
                      className="shrink-0 px-2 text-xs font-semibold text-neutral-700"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        target="임시저장 분양글"
        onConfirm={handleDelete}
        isPending={deleteDraft.isPending}
      />
    </div>
  )
}

export { AdoptionDraftsContent }
