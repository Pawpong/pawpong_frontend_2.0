'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { AsyncState, BeforeAfterSlider, Button } from '@/shared/ui'
import { PHOTO_ACCEPT } from '@/shared/lib/preparePhoto'
import type { ComparisonPhoto } from '../lib/postAiComparison'
import type { PostAiComparisonEditorState } from '../lib/usePostAiComparison'
import { AiPostShareChoice } from './AiPostShareChoice'

export function PostAiComparisonEditor({
  editor,
  photos,
  disabled,
}: {
  editor: PostAiComparisonEditorState
  photos: ComparisonPhoto[]
  disabled?: boolean
}) {
  const [showArchive, setShowArchive] = useState(false)
  const archive = useQuery(aiImageQueries.myGenerations(showArchive))
  const choices = photos
    .map((photo, index) => ({ photo, index }))
    .filter(({ photo }) => !editor.choice.sources.includes(photo))
  if (!photos.length && !editor.choice.enabled) return null
  return (
    <section
      className="space-y-3 rounded-xl border border-primary-200 p-4"
      aria-label="AI 사진 비교 공개 설정"
    >
      <h3 className="text-sm font-bold text-primary-700">포퐁 AI 비포·애프터</h3>
      <AiPostShareChoice
        checked={editor.choice.enabled}
        onChange={editor.toggle}
        disabled={disabled}
      />
      {editor.choice.enabled && (
        <>
          <label className="block text-sm font-medium">
            비교할 AI 결과 사진
            <select
              className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm"
              value={photos.indexOf(editor.submission.after as ComparisonPhoto)}
              disabled={disabled || editor.busy}
              onChange={(event) => editor.chooseAfter(photos[Number(event.target.value)])}
            >
              <option value={-1} disabled>
                AI 사진을 골라 주세요
              </option>
              {choices.map(({ index }) => (
                <option key={index} value={index}>
                  {index + 1}번째 사진
                </option>
              ))}
            </select>
          </label>
          {editor.beforeSrc && editor.afterSrc && (
            <div className="mx-auto w-full max-w-md">
              <BeforeAfterSlider beforeSrc={editor.beforeSrc} afterSrc={editor.afterSrc} />
              <p className="mt-2 text-center text-xs text-neutral-600">
                좌우로 움직여 다른 사용자에게 보일 모습을 확인해요.
              </p>
            </div>
          )}
          {editor.busy && (
            <p role="status" className="text-sm text-neutral-600">
              비교할 원본을 준비하고 있어요…
            </p>
          )}
          {editor.error && (
            <p role="alert" className="text-sm text-error-500">
              {editor.error}
            </p>
          )}
          {editor.submission.error && (
            <p role="status" className="text-sm text-neutral-600">
              {editor.submission.error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              intent="secondary"
              disabled={disabled || editor.busy}
              onClick={() => setShowArchive((open) => !open)}
            >
              보관함에서 원본 찾기
            </Button>
            <label className="flex min-h-11 cursor-pointer items-center rounded-lg border border-neutral-200 px-3 text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500">
              원본 사진 선택
              <input
                type="file"
                accept={PHOTO_ACCEPT}
                className="sr-only"
                disabled={disabled || editor.busy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) void editor.chooseFile(file)
                }}
              />
            </label>
          </div>
          {showArchive && (
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="mb-3 text-xs text-neutral-700">
                게시글에 사용한 AI 사진을 고르면 그 사진의 원본을 연결해요.
              </p>
              {archive.isPending ? (
                <p role="status" className="text-sm">
                  보관함을 불러오고 있어요…
                </p>
              ) : archive.isError ? (
                <AsyncState
                  status="error"
                  message="보관함을 불러오지 못했어요. 글과 사진은 그대로 있어요."
                  onRetry={() => void archive.refetch()}
                  isRetrying={archive.isFetching}
                />
              ) : (
                <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                  {(archive.data ?? [])
                    .filter((job) => job.status === 'succeeded' && job.resultImageUrl)
                    .map((job, index) => (
                      <button
                        type="button"
                        key={job.jobId}
                        disabled={disabled || editor.busy}
                        aria-label={`${index + 1}번째 AI 사진의 원본 연결`}
                        className="relative aspect-square overflow-hidden rounded-lg border border-primary-200 focus-ring"
                        onClick={() => {
                          void editor.chooseArchive(job.jobId)
                          setShowArchive(false)
                        }}
                      >
                        <Image
                          src={job.resultImageUrl!}
                          alt="내 AI 사진"
                          fill
                          sizes="120px"
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    ))}
                  {!archive.data?.some(
                    (job) => job.status === 'succeeded' && job.resultImageUrl,
                  ) && (
                    <p className="col-span-3 text-sm">
                      연결할 AI 사진이 없어요. 원본 사진을 직접 선택해 주세요.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-neutral-600">
            비교를 끄면 연결한 원본은 게시글에서 빠지고 AI 결과만 남아요.
          </p>
        </>
      )}
    </section>
  )
}
