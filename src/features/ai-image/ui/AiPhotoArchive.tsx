'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiImageQueries, hideAiImageGeneration } from '@/entities/ai-image'
import { cn } from '@/shared/lib/cn'
import type { AiImageGeneration } from '@/shared/types'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  EmptyState,
} from '@/shared/ui'
import { fetchAiImageFile, saveAiImageFile } from '../lib/aiImageFile'
import { setPendingCommunityPhoto } from '../lib/pendingCommunityPhoto'

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
  const router = useRouter()
  const queryClient = useQueryClient()
  const generationsQuery = useQuery(aiImageQueries.myGenerations(enabled))
  const filtersQuery = useQuery(aiImageQueries.filters())
  const [openJobId, setOpenJobId] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<'save' | 'post' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const hideMutation = useMutation({
    mutationFn: hideAiImageGeneration,
    onSuccess: () => {
      setOpenJobId(null)
      void queryClient.invalidateQueries({ queryKey: aiImageQueries.myGenerations().queryKey })
    },
  })

  const filterName = (filterId: string) =>
    filtersQuery.data?.find((filter) => filter.filterId === filterId)?.name ?? 'AI 필터'

  const items = (generationsQuery.data ?? []).filter((job) => job.status !== 'failed')
  const visible = limit ? items.slice(0, limit) : items
  const opened = items.find((job) => job.jobId === openJobId) ?? null

  const runAction = async (action: 'save' | 'post', job: AiImageGeneration) => {
    setBusyAction(action)
    setActionError(null)
    try {
      const file = await fetchAiImageFile(job.jobId)
      if (action === 'save') {
        await saveAiImageFile(file)
      } else {
        setPendingCommunityPhoto(file)
        router.push('/community/write')
      }
    } catch {
      setActionError('사진을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusyAction(null)
    }
  }

  if (!enabled) return null
  if (generationsQuery.isPending) {
    return <EmptyState message="보관함을 불러오는 중이에요." illustration={false} size="compact" />
  }
  if (generationsQuery.isError) {
    return (
      <EmptyState
        role="alert"
        illustration={false}
        size="compact"
        message="보관함을 불러오지 못했어요."
        action={
          <Button
            variant="outline"
            size="sm"
            className="px-4"
            onClick={() => void generationsQuery.refetch()}
          >
            다시 시도
          </Button>
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
                onClick={() => setOpenJobId(job.jobId)}
                aria-label={`${filterName(job.filterId)} 사진 ${done ? '크게 보기' : '만드는 중'}`}
                className="relative block aspect-square w-full overflow-hidden rounded-lg bg-point-50 focus-visible:outline-2 focus-visible:outline-primary-500"
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
          if (!open) {
            setOpenJobId(null)
            setActionError(null)
          }
        }}
      >
        {opened?.resultImageUrl && (
          <DialogContent className="max-w-md">
            <DialogTitle>{filterName(opened.filterId)}</DialogTitle>
            <DialogDescription>{formatDate(opened.createdAt)}에 만들었어요</DialogDescription>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50">
              <Image
                src={opened.resultImageUrl}
                alt={`${filterName(opened.filterId)} 결과`}
                fill
                unoptimized
                sizes="(min-width: 768px) 448px, 100vw"
                className="object-contain"
              />
            </div>
            {actionError && (
              <p role="alert" className="text-sm text-error-500">
                {actionError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={!!busyAction}
                onClick={() => void runAction('save', opened)}
              >
                {busyAction === 'save' ? '준비 중…' : '저장하기'}
              </Button>
              <Button
                size="lg"
                disabled={!!busyAction}
                onClick={() => void runAction('post', opened)}
              >
                {busyAction === 'post' ? '준비 중…' : '커뮤니티에 올리기'}
              </Button>
            </div>
            <Button
              variant="text"
              disabled={hideMutation.isPending}
              onClick={() => hideMutation.mutate(opened.jobId)}
              className="min-h-11 justify-self-center text-neutral-700"
            >
              {hideMutation.isPending ? '지우는 중…' : '보관함에서 지우기'}
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
