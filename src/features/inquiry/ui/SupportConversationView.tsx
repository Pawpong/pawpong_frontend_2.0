import { useEffect, useRef } from 'react'
import { PawPrintIcon } from '@/shared/assets'
import { Button } from '@/shared/ui'
import type { SupportSession } from '../model/supportChatController'
import type { SUPPORT_TOPICS } from '../model/supportTopics'

type Props = {
  session: SupportSession
  topic: (typeof SUPPORT_TOPICS)[number]
  open: boolean
  onSuggestion: (text: string) => void
  onRetry: () => void
  onRefresh: () => void
  onRestart: () => void
  onSubmit: () => void
}

export function SupportConversationView({
  session,
  topic,
  open,
  onSuggestion,
  onRetry,
  onRefresh,
  onRestart,
  onSubmit,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const following = useRef(true)
  const { conversation, pendingTurn, phase, error } = session
  const messages = conversation?.messages ?? []
  const busy = phase !== 'idle'
  const submission = conversation?.submission
  const draft = conversation?.draft

  useEffect(() => {
    if (open && following.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [open, messages.length, pendingTurn, phase, error])

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 tab:px-6"
      onScroll={(event) => {
        const element = event.currentTarget
        following.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
      }}
      role="log"
      aria-label={`${topic.label} 대화`}
      aria-live="polite"
      aria-relevant="additions text"
      tabIndex={0}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
          <PawPrintIcon aria-hidden className="size-5" /> 포퐁 AI
        </div>
        <p className="max-w-[92%] rounded-xl rounded-tl-none border border-primary-100 bg-white p-3 text-sm leading-relaxed text-neutral-850">
          {topic.greeting}
        </p>
        {messages.length === 0 && !pendingTurn && (
          <div className="flex flex-wrap gap-2" aria-label="질문 예시">
            {topic.suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => onSuggestion(suggestion)}
                className="min-h-11 rounded-lg border border-primary-100 bg-white px-3 py-2 text-left text-xs text-primary-700 focus-ring hover:bg-point-100 motion-reduce:transition-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.createdAt}-${index}`}
            className={message.role === 'user' ? 'flex justify-end' : ''}
          >
            <div className={message.role === 'user' ? 'max-w-[88%]' : 'max-w-[92%]'}>
              <p
                className={`mb-1 text-xs font-semibold ${message.role === 'user' ? 'text-right text-neutral-700' : 'text-primary-700'}`}
              >
                {message.role === 'user' ? '나' : '포퐁 AI'}
              </p>
              <p
                className={`rounded-xl p-3 text-sm leading-relaxed break-words whitespace-pre-wrap ${message.role === 'user' ? 'rounded-tr-none bg-point-500 text-neutral-850' : 'rounded-tl-none border border-primary-100 bg-white text-neutral-850'}`}
              >
                {message.content}
              </p>
              {message.role === 'assistant' &&
                index === messages.length - 1 &&
                !!conversation?.sources.length && (
                  <details className="mt-2 rounded-lg border border-primary-100 bg-white px-3 text-sm">
                    <summary className="flex min-h-11 cursor-pointer items-center text-xs font-semibold text-primary-700 focus-ring">
                      참고한 포퐁 안내
                    </summary>
                    <div className="space-y-3 pb-3">
                      {conversation.sources.map((source) => (
                        <article key={source.faqId}>
                          <h3 className="font-semibold">{source.question}</h3>
                          <p className="mt-1 leading-relaxed break-words whitespace-pre-wrap text-neutral-700">
                            {source.answer}
                          </p>
                        </article>
                      ))}
                    </div>
                  </details>
                )}
              {message.role === 'assistant' &&
                index === messages.length - 1 &&
                conversation?.needsHumanSupport && (
                  <p className="mt-2 text-xs leading-relaxed text-primary-700">
                    정확한 확인이 필요한 내용은 아래에서 운영팀에 전달할 수 있어요.
                  </p>
                )}
            </div>
          </div>
        ))}
        {pendingTurn && (
          <div className="ml-auto max-w-[88%]">
            <p className="mb-1 text-right text-xs font-semibold text-neutral-700">나</p>
            <p className="rounded-xl rounded-tr-none border border-primary-100 bg-point-100 p-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {pendingTurn.message}
            </p>
            <p className="mt-1 text-right text-xs text-neutral-700">
              {phase === 'sending' ? '답변을 기다리고 있어요' : '전송 결과 확인이 필요해요'}
            </p>
          </div>
        )}
        {phase === 'sending' && (
          <p role="status" className="flex items-center gap-2 text-sm text-primary-700">
            <PawPrintIcon aria-hidden className="size-4" />
            포퐁 AI가 답변을 준비하고 있어요…
          </p>
        )}
        {error && (
          <div className="rounded-lg border border-error-500 bg-white p-3">
            <p role="alert" className="text-sm leading-relaxed text-error-600">
              {error.message}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="lg"
                intent="secondary"
                disabled={busy}
                onClick={
                  error.recovery === 'restart'
                    ? onRestart
                    : error.recovery === 'refresh'
                      ? onRefresh
                      : onRetry
                }
              >
                {error.recovery === 'restart'
                  ? '작성 내용으로 새 대화'
                  : error.recovery === 'refresh'
                    ? '상태 다시 확인'
                    : '같은 요청 다시 시도'}
              </Button>
            </div>
          </div>
        )}
        {draft && !pendingTurn && !submission && (
          <section
            aria-label="운영팀에 전달할 내용"
            className="rounded-xl border border-primary-200 bg-white p-4"
          >
            <p className="text-xs font-semibold text-primary-700">함께 정리한 내용</p>
            <h3 className="mt-2 text-sm font-semibold text-neutral-850">{draft.title}</h3>
            <p className="mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {draft.summary}
            </p>
            {!!draft.conditions.length && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-neutral-700">
                {draft.conditions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            {!!draft.additionalInfo.length && (
              <div className="mt-3 text-sm text-neutral-700">
                <p className="font-semibold">추가 참고사항</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {draft.additionalInfo.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-xs leading-relaxed text-neutral-700">
              수정할 점은 대화로 알려주세요. 아래 버튼을 누르면 이 내용과 전체 대화를 운영팀에
              전달해요.
            </p>
            <div className="mt-3">
              <Button
                size="lg"
                width="full"
                onClick={onSubmit}
                disabled={busy || !!session.draft.trim() || session.submissionRevision !== null}
              >
                {phase === 'submitting' ? '접수하고 있어요…' : '이 내용으로 운영팀에 전달'}
              </Button>
            </div>
            {!!session.draft.trim() && (
              <p className="mt-2 text-xs text-neutral-700">작성 중인 메시지를 먼저 보내주세요.</p>
            )}
          </section>
        )}
        {submission && (
          <section role="status" className="rounded-xl border border-primary-200 bg-white p-4">
            <p className="font-semibold text-primary-700">문의가 접수되었어요</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              {submission.deliveryStatus === 'delivered'
                ? '운영팀에 대화와 정리한 내용이 전달되었어요. 보내주신 내용을 확인할게요.'
                : submission.deliveryStatus === 'failed'
                  ? '운영팀으로 전달하는 중 문제가 생겼어요. 문의는 접수되어 있으니 다시 접수하지 않아도 돼요.'
                  : '운영팀으로 전달을 기다리고 있어요. 다시 접수하지 않아도 돼요.'}
            </p>
            {submission.deliveryStatus !== 'delivered' && (
              <div className="mt-3">
                <Button size="lg" intent="secondary" disabled={busy} onClick={onRefresh}>
                  전달 상태 확인
                </Button>
              </div>
            )}
          </section>
        )}
        {(error || conversation?.needsHumanSupport || submission) && (
          <div className="text-xs leading-relaxed text-neutral-700">
            <p>개별 회신이 필요하면 이메일 문의로 연락해 주세요.</p>
            <a
              href="mailto:coldingcontact@gmail.com"
              className="inline-flex min-h-11 items-center rounded-lg text-primary-700 underline underline-offset-4 focus-ring"
            >
              담당자에게 이메일 문의
            </a>
            <p>메일 앱에서 직접 작성해 보내주세요. 대화 내용은 자동으로 첨부되지 않아요.</p>
          </div>
        )}
        {!!messages.length && (
          <p className="text-xs leading-relaxed text-neutral-700">
            AI 안내는 정확하지 않을 수 있어요. 계정 확인이나 개별 처리는 운영팀이 도와드려요.
          </p>
        )}
      </div>
    </div>
  )
}
