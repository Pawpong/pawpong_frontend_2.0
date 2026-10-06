'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  communityExperienceConfigOptions,
  readCommunityAiAnswer,
  requestCommunityAiAnswer,
} from '@/entities/community'
import { SharedRouteMap } from '@/features/care-map'
import { usePurchases } from '@/features/in-app-purchase'
import { getAccessToken } from '@/shared/api/token'
import { isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import type { CommunityPostDetail } from '@/shared/types'

export function CommunityExperiencePanel({
  post,
  isOwner,
}: {
  post: CommunityPostDetail
  isOwner: boolean
}) {
  const config = useQuery(communityExperienceConfigOptions)
  const { generation } = usePurchases()
  const active = config.data?.enabled === true && !config.isError
  if (!active || !post.experience) return null
  return (
    <section
      className="space-y-4 border-b border-neutral-100 bg-point-50/40 p-4"
      aria-label="공유한 경험"
    >
      <div className="flex flex-wrap gap-2">
        {post.experience.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-lg border border-primary-200 bg-white px-2 py-1 text-xs font-semibold"
          >
            {config.data?.topics.find((value) => value.key === topic)?.label ?? topic}
          </span>
        ))}
      </div>
      {post.experience.route.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold">함께 가볼 공개 장소</h3>
          <SharedRouteMap points={post.experience.route} />
          <ol className="list-inside list-decimal text-sm">
            {post.experience.route.map((point, index) => (
              <li key={index}>{point.name}</li>
            ))}
          </ol>
          <p className="text-xs text-neutral-600">
            작성자가 선택한 장소를 순서대로 연결한 지도예요. 실제 도로·산책 길 안내는 아니에요.
          </p>
        </div>
      )}
      {post.experience.question && (
        <p className="text-sm font-semibold">궁금한 점이 있다면 댓글로 경험을 나눠주세요.</p>
      )}
      {post.experience.question && config.data?.aiEnabled && (
        <CommunityAnswer
          key={`${post.postId}:${post.body}:${generation}`}
          post={post}
          isOwner={isOwner}
          generation={generation}
          notice={config.data.aiNotice}
        />
      )}
    </section>
  )
}

function CommunityAnswer({
  post,
  isOwner,
  generation,
  notice,
}: {
  post: CommunityPostDetail
  isOwner: boolean
  generation: number
  notice: string
}) {
  const [consent, setConsent] = useState(false)
  const client = useQueryClient()
  const queryKey = [
    'community',
    'ai-answer',
    post.postId,
    post.body,
    post.title,
    post.experience?.topics,
    generation,
  ]
  const result = useQuery({
    queryKey,
    queryFn: ({ signal }) => readCommunityAiAnswer(post.postId, signal),
    retry: false,
    gcTime: 0,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 2000 : false),
  })
  const request = useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      if (!consent || !isOwner || !token || !isAuthSessionCurrent(generation))
        throw new Error('내 질문에서 동의 후 요청해 주세요.')
      const answer = await requestCommunityAiAnswer(post.postId)
      if (token !== getAccessToken() || !isAuthSessionCurrent(generation))
        throw new Error('로그인 정보가 변경됐어요. 답변을 다시 확인해 주세요.')
      return answer
    },
    onSuccess: (answer) => client.setQueryData(queryKey, answer),
  })
  const answer = result.data
  const pending = request.isPending || answer?.status === 'pending'
  return (
    <div className="rounded-xl border-2 border-primary-200 bg-white p-4" aria-label="AI 참고 답변">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">포퐁 AI 참고 답변</h3>
        <span className="rounded bg-point-100 px-2 py-1 text-xs">AI 생성</span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-neutral-600">{notice}</p>
      {answer?.status === 'completed' && (
        <>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
          {answer.needsVet && (
            <p className="mt-3 rounded-lg bg-point-50 p-3 text-xs font-semibold">
              증상·응급 여부는 AI 답변만으로 판단하지 마세요. 동물병원이나 담당 수의사에게 확인해
              주세요.
            </p>
          )}
        </>
      )}
      {pending && (
        <p role="status" className="text-sm">
          참고 답변을 준비하고 있어요. 새 답변 요청은 하지 않고 상태만 확인합니다.
        </p>
      )}
      {answer?.status === 'failed' && (
        <p role="status" className="text-sm text-neutral-700">
          답변을 만들지 못했어요. 댓글로 경험을 나누거나 동의 후 다시 요청할 수 있어요.
        </p>
      )}
      {result.isError && (
        <button type="button" className="text-sm underline" onClick={() => void result.refetch()}>
          답변 상태를 다시 확인하기
        </button>
      )}
      {!answer && !pending && !result.isError && (
        <p className="text-sm text-neutral-600">
          아직 AI 답변이 없어요. 사람들의 댓글 답변과 함께 참고할 수 있어요.
        </p>
      )}
      {isOwner && !pending && answer?.status !== 'completed' && (
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2 text-xs leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            질문 본문과 주제를 AI에 전달하는 데 동의합니다. 개인정보는 적지 마세요. 사진·지도 좌표는
            전달하지 않습니다.
          </label>
          <button
            type="button"
            disabled={!consent || result.isPending || result.isError}
            className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-bold disabled:opacity-40"
            onClick={() => request.mutate()}
          >
            AI 참고 답변 받기
          </button>
          <p className="text-xs text-neutral-600">
            개발 체험 중이며 하루 최대 3회예요. AI는 잘못된 답변을 할 수 있어요.
          </p>
        </div>
      )}
      {request.isError && (
        <p role="alert" className="mt-2 text-sm">
          {request.error.message || 'AI 답변을 요청하지 못했어요.'}
        </p>
      )}
    </div>
  )
}
