'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Container,
  DeleteConfirmModal,
  ListState,
  NavigationBar,
  Separator,
} from '@/shared/ui'
import { TEXT } from '@/shared/config'
import { PetPostingDraftCard, petPostingQueries } from '@/entities/pet-posting'
import { useDeletePetPostingDraft } from '@/features/pet-posting'

/** 임시저장 카드를 누르면 작성 화면에서 이어서 쓴다 */
const AdoptionDraftsContent = () => {
  const { data, isPending, isError, refetch } = useQuery({
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
    <div className="flex w-full flex-col">
      <NavigationBar title="임시저장" backHref="/home" />

      <Container className="px-4 pt-5 pb-10 tab:pt-8 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          <header className="mb-5 tab:mb-7">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={TEXT.section}>작성 중인 분양글</h1>
                {!isPending && !isError && <Badge variant="pointCount">{drafts.length}</Badge>}
              </div>
              <p className={`${TEXT.meta} mt-1`}>저장한 내용을 확인하고 이어서 작성할 수 있어요.</p>
            </div>
          </header>

          <ListState
            isPending={isPending}
            isError={isError}
            isEmpty={drafts.length === 0}
            loadingText="임시저장한 분양글을 불러오는 중입니다."
            errorText="임시저장한 분양글을 불러오지 못했습니다."
            emptyText={
              <span>
                임시저장한 분양글이 없어요.
                <br />새 분양글을 작성해 보세요.
              </span>
            }
            errorAction={
              <Button variant="fill" size="sm" onClick={() => void refetch()} className="px-4">
                다시 시도
              </Button>
            }
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
          </ListState>
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
