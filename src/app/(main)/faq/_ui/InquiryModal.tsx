'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askSupport, submitSupportFeedback } from '@/features/inquiry'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets'
import {
  Button,
  Dialog,
  DialogOverlay,
  DialogPortal,
  ExitConfirmModal,
  Textarea,
  IconButton,
} from '@/shared/ui'

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audience: 'adopter' | 'breeder'
}

// 이미 SiteFooter에 공개돼 있는 지원 이메일과 같은 주소 — 새로 만든 값이 아니다
const SUPPORT_EMAIL = 'coldingcontact@gmail.com'

/**
 * 직접 문의 작성 모달 (Figma 4161:889794 · Q&A modal, exit-confirm 4161:889796).
 *
 * AI 안내 전에 운영팀 확인용 문의를 저장한다.
 * 개별 회신 경로는 이메일로 제공하고, 메일 작성 후에도 원문을 보존한다.
 */
const InquiryModal = ({ open, onOpenChange, audience }: InquiryModalProps) => {
  const [text, setText] = useState('')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const feedback = useMutation({
    mutationFn: () => submitSupportFeedback(text.trim(), audience),
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
    answer.reset()
    feedback.reset()
    onOpenChange(false)
  }

  const handleSend = () => {
    const subject = encodeURIComponent('[Pawpong 문의]')
    const body = encodeURIComponent(text.trim())
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    // 메일 앱을 여는 것만으로 접수된 것은 아니므로 원문을 보존한다.
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-modal flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-[39.75rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]"
          >
            <DialogPrimitive.Title className="px-6 pt-5 font-semibold">
              포퐁 AI 문의 안내
            </DialogPrimitive.Title>

            <div className="flex items-center justify-end px-3 py-2 tab:px-6 tab:py-3">
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

            <div className="px-3 pb-3 tab:px-6 tab:pb-4">
              <p className="mb-3 text-sm text-neutral-700">
                AI가 먼저 안내하고, 문의 내용은 운영팀도 확인합니다. 추가 확인이나 개별 답변이
                필요하면 아래 이메일 문의로 연락해 주세요. 비밀번호 등 민감한 정보는 입력하지 마세요.
              </p>
              <Textarea
                aria-label="서비스 이용 질문"
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  answer.reset()
                  feedback.reset()
                }}
                maxLength={2000}
                disabled={isPending}
                placeholder="문의를 남겨주세요"
                className="h-52"
                autoFocus
              />
              <span className="text-xs text-neutral-500">{text.length}/2000</span>
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
                  <p className="text-sm font-semibold">AI가 찾은 FAQ 안내</p>
                  {answer.data.sources.map((source) => (
                    <article key={source.faqId} className="space-y-2">
                      <h3 className="text-sm font-semibold">{source.question}</h3>
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {source.answer}
                      </p>
                    </article>
                  ))}
                  {answer.data.needsHumanSupport && (
                    <p className="text-sm">
                      AI만으로는 안내하기 어려워요. 접수한 내용을 운영팀이 확인합니다. 개별 회신이
                      필요하면 아래 이메일 문의로 연락해 주세요.
                    </p>
                  )}
                  <p className="text-xs text-neutral-700">
                    FAQ를 바탕으로 한 AI 안내입니다. 운영팀은 접수된 문의를 별도로 확인합니다.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 px-6 py-3">
              <Button
                size="md"
                onClick={() => answer.mutate()}
                disabled={!text.trim() || isPending}
              >
                AI에게 문의하기
              </Button>
              <Button
                size="md"
                onClick={() => feedback.mutate()}
                disabled={!text.trim() || isPending || feedback.isSuccess}
              >
                운영팀에 문의 접수
              </Button>
              <div className="flex w-full max-w-[16.125rem]">
                <Button
                  size="md"
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

export { InquiryModal }
