'use client'

import { useState, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon, PawPrintIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import {
  Button,
  Dialog,
  DialogOverlay,
  DialogPortal,
  ExitConfirmModal,
  Textarea,
  IconButton,
} from '@/shared/ui'
import { askSupport, submitSupportFeedback } from '../api/support.api'

interface SupportInquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audience: 'adopter' | 'breeder'
  presentation?: 'dialog' | 'sheet'
  trigger?: ReactNode
}

// 이미 SiteFooter에 공개돼 있는 지원 이메일과 같은 주소 — 새로 만든 값이 아니다
const SUPPORT_EMAIL = 'coldingcontact@gmail.com'
const MAX_QUESTION_LENGTH = 1900
const SUPPORT_TOPICS = [
  {
    id: 'usage',
    label: '이용 방법',
    hint: '포퐁 이용이 궁금해요',
    placeholder: '예: AI 사진 생성 횟수는 언제 다시 생기나요?',
  },
  {
    id: 'error',
    label: '오류 신고',
    hint: '이용 중 문제가 생겼어요',
    placeholder: '어느 화면에서 어떤 문제가 생겼나요? 발생 시점과 시도한 방법을 알려주세요.',
  },
  {
    id: 'account',
    label: '계정 문의',
    hint: '계정·설정을 확인해요',
    placeholder: '예: 탈퇴와 계정 영구삭제는 어떻게 다른가요?',
  },
  {
    id: 'feedback',
    label: '개선 제안',
    hint: '이런 기능이 있으면 좋겠어요',
    placeholder: '불편했던 점이나 포퐁에 바라는 점을 자유롭게 알려주세요.',
  },
] as const
type SupportTopic = (typeof SUPPORT_TOPICS)[number]['id']

/**
 * 직접 문의 작성 모달 (Figma 4161:889794 · Q&A modal, exit-confirm 4161:889796).
 *
 * AI 안내 전에 운영팀 확인용 문의를 저장한다.
 * 개별 회신 경로는 이메일로 제공하고, 메일 작성 후에도 원문을 보존한다.
 */
const SupportInquiryModal = ({
  open,
  onOpenChange,
  audience,
  presentation = 'dialog',
  trigger,
}: SupportInquiryModalProps) => {
  const [text, setText] = useState('')
  const [topic, setTopic] = useState<SupportTopic>('usage')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const selectedTopic = SUPPORT_TOPICS.find((item) => item.id === topic)!
  const directFeedback = topic === 'error' || topic === 'feedback'
  // 기존 접수 API에도 문의 유형이 남도록 원문 앞에 짧은 분류를 함께 보낸다.
  const feedbackMessage = `[${selectedTopic.label}]\n${text.trim()}`
  const feedback = useMutation({
    mutationFn: () => submitSupportFeedback(feedbackMessage, audience),
    retry: false,
    throwOnError: false,
  })
  const answer = useMutation({
    mutationFn: async () => {
      // AI 안내가 실패해도 운영팀에는 접수 내용이 남는다. 재시도는 중복 접수를 만들지 않는다.
      if (!feedback.isSuccess) await feedback.mutateAsync()
      return askSupport(text.trim(), audience)
    },
    retry: false,
    throwOnError: false,
  })
  const isPending = answer.isPending || feedback.isPending

  // 입력 중인 내용이 있으면 바로 닫지 않고 삭제 확인을 먼저 보여준다
  const requestClose = () => {
    if (isPending) return
    if (feedback.isSuccess) {
      discard()
      return
    }
    if (text.trim()) {
      setShowExitConfirm(true)
      return
    }
    onOpenChange(false)
  }

  const discard = () => {
    setShowExitConfirm(false)
    setText('')
    setTopic('usage')
    answer.reset()
    feedback.reset()
    onOpenChange(false)
  }

  const handleSend = () => {
    const subject = encodeURIComponent('[Pawpong 문의]')
    const body = encodeURIComponent(
      `${feedbackMessage}${feedback.data ? `\n\n접수번호: ${feedback.data.receiptId}` : ''}`,
    )
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    // 메일 앱을 여는 것만으로 접수된 것은 아니므로 원문을 보존한다.
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
        {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              'fixed z-modal flex max-h-[85dvh] flex-col overflow-y-auto bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
              presentation === 'sheet'
                ? 'inset-x-0 bottom-0 rounded-t-[1.25rem] pb-[env(safe-area-inset-bottom)]'
                : 'top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-[39.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl',
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-150 px-4 py-3 tab:px-6">
              <DialogPrimitive.Title className="font-semibold text-neutral-850">
                AI 문의하기
              </DialogPrimitive.Title>
              <IconButton
                tone="muted"
                size="sm"
                onClick={requestClose}
                aria-label="닫기"
                disabled={isPending}
              >
                <CloseIcon className="size-5 tab:size-6" />
              </IconButton>
            </div>

            <div className="px-4 py-4 tab:px-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-point-100 text-primary-500">
                  <PawPrintIcon aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="text-base font-semibold text-neutral-850">무엇을 도와드릴까요?</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-700">
                    이용 안내부터 불편했던 점까지 알려주세요.
                  </p>
                </div>
              </div>
              <div role="group" aria-label="문의 유형" className="mb-4 grid grid-cols-2 gap-2">
                {SUPPORT_TOPICS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={topic === item.id}
                    disabled={isPending}
                    onClick={() => {
                      if (topic === item.id) return
                      setTopic(item.id)
                      answer.reset()
                      feedback.reset()
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-left focus-ring transition-colors disabled:opacity-50',
                      topic === item.id
                        ? 'border-primary-500 bg-point-50 text-primary-700'
                        : 'border-action-border bg-white text-neutral-850 hover:bg-action-subtle',
                    )}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-neutral-700">
                      {item.hint}
                    </span>
                  </button>
                ))}
              </div>
              <Textarea
                aria-label="서비스 이용 질문"
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  answer.reset()
                  feedback.reset()
                }}
                maxLength={MAX_QUESTION_LENGTH}
                disabled={isPending}
                placeholder={selectedTopic.placeholder}
                className={presentation === 'sheet' ? 'h-28 text-base' : 'h-36'}
                autoFocus={presentation === 'dialog'}
              />
              <div className="mt-2 flex justify-between gap-3 text-xs text-neutral-700">
                <span>비밀번호·인증번호는 입력하지 마세요.</span>
                <span className="shrink-0">
                  {text.length}/{MAX_QUESTION_LENGTH}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-700">
                {directFeedback
                  ? '보내주신 내용은 운영팀에 접수돼요. 개별 회신이 필요하면 이메일로 문의해 주세요.'
                  : 'AI가 이용 안내를 찾아 답하고, 문의 내용은 운영팀도 함께 확인해요.'}
              </p>
              {feedback.isPending && (
                <p role="status" className="mt-3 text-sm">
                  문의를 접수하고 있어요…
                </p>
              )}
              {feedback.isError && (
                <p role="alert" className="mt-3 text-sm text-error-500">
                  문의를 접수하지 못했습니다. 작성 내용은 유지됩니다. 잠시 후 다시 시도하거나
                  이메일로 문의해 주세요.
                </p>
              )}
              {feedback.data && (
                <p role="status" className="mt-3 text-sm text-neutral-700">
                  문의가 접수되었습니다. 운영팀이 내용을 확인할게요.
                  <br />
                  <span className="text-xs break-all">접수번호: {feedback.data.receiptId}</span>
                </p>
              )}
              {answer.isPending && (
                <p role="status" className="mt-3 text-sm">
                  관련 안내를 찾고 있어요…
                </p>
              )}
              {answer.isError && (
                <p role="alert" className="mt-3 text-sm text-error-500">
                  {answer.error instanceof Error
                    ? answer.error.message
                    : 'AI 안내를 불러오지 못했습니다.'}{' '}
                  작성 내용은 유지됩니다.
                </p>
              )}
              {answer.data && (
                <div aria-live="polite" className="mt-4 space-y-3 rounded-lg bg-point-50 p-4">
                  <p className="text-sm font-semibold">포퐁 AI 안내</p>
                  {answer.data.answer && (
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {answer.data.answer}
                    </p>
                  )}
                  {answer.data.sources.length > 0 && (
                    <details
                      open={!answer.data.answer}
                      className="rounded-lg border border-neutral-150 bg-white p-3"
                    >
                      <summary className="cursor-pointer text-xs font-semibold text-primary-600 focus-ring">
                        참고한 안내
                      </summary>
                      <div className="mt-3 space-y-3">
                        {answer.data.sources.map((source) => (
                          <article key={source.faqId} className="space-y-1">
                            <h3 className="text-sm font-semibold">{source.question}</h3>
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {source.answer}
                            </p>
                          </article>
                        ))}
                      </div>
                    </details>
                  )}
                  {answer.data.needsHumanSupport && (
                    <p className="text-sm">
                      AI만으로는 안내하기 어려워요. 접수한 내용을 운영팀이 확인합니다. 개별 회신이
                      필요하면 아래 이메일 문의로 연락해 주세요.
                    </p>
                  )}
                  <p className="text-xs text-neutral-700">
                    포퐁의 이용 안내를 바탕으로 한 AI 답변이에요. 계정 확인이나 개별 처리는 운영팀에
                    문의해 주세요.
                  </p>
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex gap-2 px-4 pt-1 pb-4 tab:px-6',
                presentation === 'sheet' ? 'flex-col' : 'flex-wrap justify-end',
              )}
            >
              <Button
                size="md"
                onClick={() => (directFeedback ? feedback.mutate() : answer.mutate())}
                disabled={
                  !text.trim() ||
                  isPending ||
                  (directFeedback ? feedback.isSuccess : answer.isSuccess)
                }
                width={presentation === 'sheet' ? 'full' : 'auto'}
              >
                {directFeedback
                  ? feedback.isSuccess
                    ? '접수 완료'
                    : `${selectedTopic.label} 접수`
                  : 'AI에게 문의하기'}
              </Button>
              {!directFeedback && (
                <Button
                  size="md"
                  intent="secondary"
                  onClick={() => feedback.mutate()}
                  disabled={!text.trim() || isPending || feedback.isSuccess}
                  width={presentation === 'sheet' ? 'full' : 'auto'}
                >
                  운영팀에 문의 접수
                </Button>
              )}
              <div className={cn('flex w-full', presentation === 'dialog' && 'max-w-[16.125rem]')}>
                <Button
                  size="md"
                  intent="ghost"
                  onClick={handleSend}
                  disabled={!text.trim() || isPending}
                  width="full"
                >
                  담당자에게 이메일 문의
                </Button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <ExitConfirmModal
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={discard}
        title="작성하신 문의는 삭제됩니다."
        confirmLabel="문의 그만두기"
      />
    </>
  )
}

export { SupportInquiryModal }
