'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Container, DeleteConfirmModal, NavigationBar, Separator } from '@/shared/ui'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedPostCard, useDeleteCommunityPost } from '@/features/community'

/** 임시저장 목록 — 카드를 누르면 수정 화면에서 이어서 작성한다 */
const DraftsContent = () => {
  const router = useRouter()
  const { data } = useQuery(communityQueries.drafts())
  const drafts = data?.items ?? []

  const deletePost = useDeleteCommunityPost()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 삭제 성공 후에만 모달을 닫는다 (실패하면 모달을 유지해 재시도 가능)
  const handleDeleteDraft = () => {
    if (!deleteTargetId || deletePost.isPending) return
    deletePost.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
  }

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="임시저장" backHref="/community" />

      <Container className="px-4 pb-10 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          {drafts.length === 0 ? (
            <p className="py-10 text-center text-sm leading-[1.5] font-medium text-neutral-700">
              임시저장한 글이 없습니다.
            </p>
          ) : (
            <div className="flex min-w-0 flex-col gap-5 tab:gap-8 tab:rounded-lg tab:border tab:border-neutral-300 tab:p-3">
              {drafts.map((draft, index) => (
                <Fragment key={draft.postId}>
                  {index > 0 && <Separator className="bg-border-light" />}
                  <ConnectedPostCard
                    {...toCommunityPreviewProps(draft)}
                    // 임시저장 글은 상세가 없으므로 수정 화면으로 바로 보낸다
                    detailHref={`/community/${draft.postId}/edit`}
                    onEdit={() => router.push(`/community/${draft.postId}/edit`)}
                    onDelete={() => setDeleteTargetId(draft.postId)}
                  />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </Container>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        target="임시저장 글"
        onConfirm={handleDeleteDraft}
        isPending={deletePost.isPending}
      />
    </div>
  )
}

export { DraftsContent }
