'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import type { AuthReadSession } from '@/shared/lib/authReadSession'
import { PetResultLink } from '@/features/playground-pet/ui/PetResultLink'
import { cn } from '@/shared/lib/cn'
import {
  RetryButton,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  EmptyState,
  DeleteConfirmModal,
} from '@/shared/ui'
import { useAiArchiveAction } from '../lib/useAiArchiveAction'
import { ArchivePhotoCompare } from './ArchivePhotoCompare'
import { AiPostShareChoice } from './AiPostShareChoice'

interface AiPhotoArchiveProps {
  /** 비로그인이면 조회하지 않는다 */
  enabled: boolean
  /** 앞에서 몇 장만 보여줄지 (필터 탭 하단 미리보기용). 없으면 전부 */
  limit?: number
  /** limit 로 잘렸을 때 전체 보기 링크 */
  moreHref?: string
  gridClassName?: string
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

/**
 * 내가 만든 AI 사진 보관함.
 * 사진을 누르면 크게 보고 저장·커뮤니티에 올리기·보관함에서 지우기를 할 수 있다.
 * 실패한 변환은 보여주지 않고, 진행 중인 것은 '만드는 중' 칸으로 둔다.
 */
export function AiPhotoArchive({ enabled, limit, moreHref, gridClassName }: AiPhotoArchiveProps) {
  const session = useAuthReadSession()
  if (!enabled || !session) return null
  return (
    <AiArchiveContent
      key={session.scope}
      session={session}
      limit={limit}
      moreHref={moreHref}
      gridClassName={gridClassName}
    />
  )
}

function AiArchiveContent({
  session,
  limit,
  moreHref,
  gridClassName,
}: Omit<AiPhotoArchiveProps, 'enabled'> & { session: AuthReadSession }) {
  const generationsQuery = useQuery(aiImageQueries.myGenerations(true, session))
  const filtersQuery = useQuery(aiImageQueries.filters())
  const [openJobId, setOpenJobId] = useState<string | null>(null)
  const [shareComparison, setShareComparison] = useState(false)
  const [confirmHide, setConfirmHide] = useState(false)

  const filterName = (filterId: string) =>
    filtersQuery.data?.find((filter) => filter.filterId === filterId)?.name ?? 'AI 필터'

  const items = (generationsQuery.data ?? []).filter((job) => job.status !== 'failed')
  const visible = limit ? items.slice(0, limit) : items
  const opened = items.find((job) => job.jobId === openJobId) ?? null
  const action = useAiArchiveAction(session, opened?.jobId ?? null)

  const close = () => {
    action.cancel()
    setOpenJobId(null)
    setConfirmHide(false)
    setShareComparison(false)
  }
  if (generationsQuery.isPending) {
    return <EmptyState message="보관함을 불러오는 중이에요." illustration={false} size="compact" />
  }
  if (generationsQuery.isError && !generationsQuery.data) {
    return (
      <EmptyState
        role="alert"
        illustration={false}
        size="compact"
        message="보관함을 불러오지 못했어요."
        action={
          <RetryButton
            onRetry={() => void generationsQuery.refetch()}
            isRetrying={generationsQuery.isFetching}
          />
        }
      />
    )
  }
  if (items.length === 0) {
    return (
      <EmptyState
        message="아직 만든 AI 사진이 없어요. 첫 작품을 만들어 볼까요?"
        action={
          <Link
            href="/ai-filter"
            className="text-sm font-semibold text-primary-700 underline underline-offset-4"
          >
            AI 필터 써 보기
          </Link>
        }
      />
    )
  }

  return (
    <>
      {generationsQuery.isError && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-700"
        >
          <p>최신 보관함을 확인하지 못했어요. 마지막으로 불러온 사진을 표시해요.</p>
          <RetryButton
            onRetry={() => void generationsQuery.refetch()}
            isRetrying={generationsQuery.isFetching}
          />
        </div>
      )}
      <ul
        className={cn('grid grid-cols-3 gap-1.5 tab:grid-cols-4 tab:gap-3', gridClassName)}
        aria-label="내 AI 사진"
      >
        {visible.map((job) => {
          const done = job.status === 'succeeded' && !!job.resultImageUrl
          return (
            <li key={job.jobId}>
              <button
                type="button"
                disabled={!done}
                onClick={() => {
                  action.cancel()
                  setConfirmHide(false)
                  setShareComparison(false)
                  setOpenJobId(job.jobId)
                }}
                aria-label={`${filterName(job.filterId)} 사진 ${done ? '크게 보기' : '만드는 중'}`}
                className="relative block aspect-square w-full overflow-hidden rounded-lg bg-point-50 focus-ring"
              >
                {done ? (
                  <Image
                    src={job.resultImageUrl!}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 200px, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full animate-pulse items-center justify-center text-xs font-semibold text-primary-700">
                    만드는 중…
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/55 to-transparent px-2 pt-4 pb-1.5 text-left text-[0.6875rem] font-semibold text-white">
                  {filterName(job.filterId)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {limit && items.length > limit && moreHref && (
        <Link
          href={moreHref}
          className="mt-3 inline-block text-sm font-semibold text-primary-700 underline underline-offset-4"
        >
          보관함 전체 보기 ({items.length})
        </Link>
      )}

      <Dialog
        open={!!opened}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        {opened?.resultImageUrl && (
          <DialogContent className="max-w-md">
            <DialogTitle>{filterName(opened.filterId)}</DialogTitle>
            <DialogDescription>{formatDate(opened.createdAt)}에 만들었어요</DialogDescription>
            <ArchivePhotoCompare
              key={opened.jobId}
              jobId={opened.jobId}
              resultImageUrl={opened.resultImageUrl}
              filterName={filterName(opened.filterId)}
            />
            <AiPostShareChoice
              checked={shareComparison}
              onChange={setShareComparison}
              disabled={!!action.busy}
            />
            <PetResultLink sourceJobId={opened.jobId} />
            {action.error && (
              <p role="alert" className="text-sm text-error-500">
                {action.error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                intent="secondary"
                size="lg"
                disabled={!!action.busy}
                onClick={() => void action.run('save')}
              >
                {action.busy === 'save' ? '준비 중…' : '저장하기'}
              </Button>
              <Button
                size="lg"
                disabled={!!action.busy}
                onClick={() => void action.run('post', shareComparison)}
              >
                {action.busy === 'post' ? '준비 중…' : '커뮤니티에 올리기'}
              </Button>
            </div>
            {(action.busy === 'post' || action.busy === 'save') && (
              <Button intent="ghost" onClick={action.cancel}>
                사진 가져오기 취소
              </Button>
            )}
            <div className="flex justify-self-center">
              <Button
                size="md"
                intent="ghost"
                disabled={!!action.busy}
                onClick={() => {
                  action.cancel()
                  setConfirmHide(true)
                }}
              >
                {action.busy === 'hide' ? '지우는 중…' : '보관함에서 지우기'}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
      <DeleteConfirmModal
        open={confirmHide && !!opened}
        onOpenChange={(open) => !action.busy && setConfirmHide(open)}
        target="보관함 사진"
        isPending={action.busy === 'hide'}
        errorMessage={action.error}
        onConfirm={async () => {
          if (await action.run('hide')) close()
        }}
      />
    </>
  )
}
