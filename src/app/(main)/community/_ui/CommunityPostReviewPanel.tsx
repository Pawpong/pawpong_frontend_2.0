'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { communityReviewConfigOptions } from '@/entities/community'
import { useCommunityReviewRequest } from '@/features/community'
import { useAuthSessionGeneration } from '@/shared/lib/useAuthSessionGeneration'
import type { CommunityPostDetail } from '@/shared/types'
import { CommunityReviewConsent } from './CommunityReviewConsent'

export function CommunityPostReviewPanel({
  post,
  isOwner,
}: {
  post: CommunityPostDetail
  isOwner: boolean
}) {
  const generation = useAuthSessionGeneration()
  if (!isOwner || !post.aiReview) return null
  const sourceKey = JSON.stringify([
    post.postId,
    generation,
    post.title,
    post.body,
    post.photoUrls,
    post.aiComparison,
    post.experience,
    post.petType,
    post.category,
    post.visibility,
    post.status,
    post.aiReview.reviewedAt,
    post.aiReview.state,
  ])
  return <ReviewForm key={sourceKey} post={post} />
}
function ReviewForm({ post }: { post: CommunityPostDetail }) {
  const [consent, setConsent] = useState(false)
  const config = useQuery(communityReviewConfigOptions)
  const request = useCommunityReviewRequest(post.postId)
  const review = post.aiReview!
  const held = review.state === 'held'
  const enabled = config.data?.enabled === true && !config.isError
  return (
    <section
      className="space-y-3 border-b border-primary-200 bg-point-50/70 p-4"
      aria-label="내 글의 공개 심사"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">
          {held ? '아직 나만 볼 수 있는 이야기' : 'AI 관련성 확인 완료'}
        </h3>
        <span className="border border-primary-300 bg-white px-2 py-1 text-xs">
          {held ? '공개 보류' : '선택한 공개 범위 적용'}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{review.message}</p>
      <p className="text-xs text-neutral-600">AI 판정은 전문 자격·의학적 신뢰 인증이 아니에요.</p>
      {held && (
        <>
          <Link
            href={`/community/post/${post.postId}/edit`}
            className="inline-block text-sm font-bold text-primary-700 underline"
          >
            내용과 사진 수정하기
          </Link>
          {enabled && config.data ? (
            <CommunityReviewConsent
              config={config.data}
              consent={consent}
              onChange={setConsent}
              disabled={request.isPending}
            />
          ) : (
            <p role="status" className="text-xs">
              지금은 심사 요청을 사용할 수 없어요. 글은 그대로 보관돼요.
            </p>
          )}
          <button
            type="button"
            disabled={!enabled || !consent || request.isPending || !review.canRequestReview}
            onClick={() => request.mutate(consent)}
            className="w-full rounded-lg border-2 border-primary-700 bg-primary-500 px-4 py-3 text-sm font-bold disabled:opacity-40"
          >
            {request.isPending ? '공개 여부 확인 중' : '동의하고 다시 심사하기'}
          </button>
          <p className="text-xs text-neutral-600">
            조회만으로는 다시 심사하거나 횟수를 사용하지 않아요.
          </p>
          {config.isError && (
            <button
              type="button"
              className="text-xs underline"
              onClick={() => void config.refetch()}
            >
              심사 설정 다시 확인하기
            </button>
          )}
        </>
      )}
      {request.isError && (
        <p role="alert" className="text-sm">
          {request.error.message}
        </p>
      )}
    </section>
  )
}
