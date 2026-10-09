'use client'

import { useRef } from 'react'
import { Button } from '@/shared/ui/Button'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import type { AuthReadSession } from '@/shared/lib/authReadSession'
import type { CommunityPostDetail } from '@/shared/types'
import { canRequestCommunityAnswer, communityAnswerContext } from './answer/communityAnswerContext'
import { useCommunityAnswer } from './answer/useCommunityAnswer'

type AnswerProps = { post: CommunityPostDetail; isOwner: boolean; notice: string }

export function CommunityAnswer(props: AnswerProps) {
  const session = useAuthReadSession()
  const context = communityAnswerContext(props.post, props.isOwner, session)
  return <AnswerContent key={context} {...props} context={context} session={session} />
}

function AnswerContent({
  post,
  isOwner,
  notice,
  context,
  session,
}: AnswerProps & {
  context: string
  session: AuthReadSession | null
}) {
  const panel = useRef<HTMLElement>(null)
  const canRequest = canRequestCommunityAnswer(post, isOwner, session)
  const { result, consent, setConsent, phase, message, request, recheck } = useCommunityAnswer({
    postId: post.postId,
    context,
    session,
    canRequest,
  })
  const answer = result.data
  const busy = phase !== 'idle'
  const pending = phase === 'requesting' || (answer?.status === 'pending' && !result.isError)
  return (
    <section
      ref={panel}
      tabIndex={-1}
      className="rounded-xl border-2 border-primary-200 bg-white p-4 focus-ring sm:p-5"
      aria-label="AI 참고 답변"
      aria-busy={busy || result.isFetching}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">포퐁 AI 참고 답변</h3>
        <span className="rounded bg-point-100 px-2 py-1 text-xs">AI 생성</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-neutral-700">{notice}</p>
      <div aria-live="polite" aria-atomic="true">
        {result.isPending && !busy && (
          <p role="status" className="text-sm text-neutral-700">
            저장된 답변을 확인하고 있어요.
          </p>
        )}
        {answer?.status === 'completed' && (
          <>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {answer.answer}
            </p>
            {answer.needsVet && (
              <p className="mt-3 rounded-lg bg-point-50 p-3 text-xs leading-relaxed font-semibold">
                증상·응급 여부는 AI 답변만으로 판단하지 마세요. 동물병원이나 담당 수의사에게 확인해
                주세요.
              </p>
            )}
          </>
        )}
        {pending && (
          <p role="status" className="text-sm leading-relaxed">
            참고 답변을 준비하고 있어요. 새 답변 요청은 하지 않고 상태만 확인해요.
          </p>
        )}
        {phase === 'checking' && (
          <p role="status" className="text-sm leading-relaxed">
            기존 요청의 접수 여부를 확인하고 있어요. 생성 요청은 다시 보내지 않아요.
          </p>
        )}
        {!busy && answer?.status === 'failed' && (
          <p role="status" className="text-sm leading-relaxed text-neutral-700">
            답변을 만들지 못했어요. 댓글로 경험을 나누거나 동의 후 다시 요청할 수 있어요.
          </p>
        )}
        {!answer && !busy && !result.isPending && !result.isError && (
          <p className="text-sm leading-relaxed text-neutral-700">
            아직 AI 답변이 없어요. 사람들의 댓글 답변과 함께 참고할 수 있어요.
          </p>
        )}
      </div>
      {result.isError && !busy && (
        <div className="mt-3 space-y-2 rounded-lg bg-neutral-50 p-3">
          <p role="alert" className="text-sm leading-relaxed">
            답변 상태를 확인하지 못했어요. 중복 생성을 막기 위해 상태부터 다시 확인해 주세요.
          </p>
          <button
            type="button"
            disabled={result.isFetching}
            className="min-h-11 rounded px-2 text-sm font-semibold underline focus-ring disabled:opacity-40"
            onClick={() => {
              panel.current?.focus({ preventScroll: true })
              void recheck()
            }}
          >
            {result.isFetching ? '답변 상태 확인 중…' : '답변 상태를 다시 확인하기'}
          </button>
        </div>
      )}
      {canRequest &&
        !busy &&
        !pending &&
        answer?.status !== 'completed' &&
        !result.isPending &&
        !result.isError && (
          <div className="mt-4 space-y-3 border-t border-primary-100 pt-4">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-relaxed">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-primary-500"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              질문 제목·본문과 주제를 AI에 전달하는 데 동의합니다. 개인정보는 적지 마세요. 사진·지도
              좌표는 전달하지 않습니다.
            </label>
            <Button
              width="full"
              disabled={!consent || result.isFetching}
              onClick={() => {
                panel.current?.focus({ preventScroll: true })
                void request()
              }}
            >
              AI 참고 답변 받기
            </Button>
            <p className="text-xs leading-relaxed text-neutral-700">
              개발 체험 중이며 하루 최대 3회예요. 접수된 요청은 실패해도 횟수에 포함될 수 있어요.
              AI는 잘못된 답변을 할 수 있어요.
            </p>
          </div>
        )}
      {message && (
        <p role="alert" className="mt-3 text-sm leading-relaxed">
          {message}
        </p>
      )}
    </section>
  )
}
