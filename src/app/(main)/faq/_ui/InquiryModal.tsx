'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askSupport } from '@/features/inquiry'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets'
import {
  Button,
  Dialog,
  DialogOverlay,
  DialogPortal,
  ExitConfirmModal,
  Textarea,
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
 * 기존 Agent의 FAQ 안내와 담당자 이메일 문의를 제공한다.
 * AI 안내는 접수·계정 처리로 표시하지 않고, 메일 작성 후에도 원문을 보존한다.
 */
const InquiryModal = ({ open, onOpenChange, audience }: InquiryModalProps) => {
  const [text, setText] = useState('')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const answer = useMutation({
    mutationFn: () => askSupport(text.trim(), audience),
    retry: false,
    throwOnError: false,
  })

  // 입력 중인 내용이 있으면 바로 닫지 않고 삭제 확인을 먼저 보여준다
  const requestClose = () => {
    if (answer.isPending) return
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
              <button
                type="button"
                onClick={requestClose}
                aria-label="닫기"
                disabled={answer.isPending}
                className="rounded-lg p-1 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <CloseIcon className="size-5 tab:size-6" />
              </button>
            </div>

            <div className="px-3 pb-3 tab:px-6 tab:pb-4">
              <p className="mb-3 text-sm text-neutral-700">
                AI가 자주 묻는 질문에서 안내를 찾아드려요. 개인정보는 입력하지 마세요. 담당자 문의는
                아래 이메일 버튼을 이용해 주세요.
              </p>
              <Textarea
                aria-label="서비스 이용 질문"
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  answer.reset()
                }}
                maxLength={2000}
                disabled={answer.isPending}
                placeholder="문의를 남겨주세요"
                className="h-52"
                autoFocus
              />
              <span className="text-xs text-neutral-500">{text.length}/2000</span>
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
                      등록된 FAQ만으로는 안내하기 어려워요. 아래 이메일 문의로 담당자에게 내용을
                      보내주세요.
                    </p>
                  )}
                  <p className="text-xs text-neutral-700">
                    FAQ를 바탕으로 한 자동 안내이며 담당자에게 접수된 문의는 아닙니다.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 px-6 py-3">
              <Button
                variant="primary"
                onClick={() => answer.mutate()}
                disabled={!text.trim() || answer.isPending}
              >
                AI 안내 받기
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!text.trim() || answer.isPending}
                className="h-10 w-full max-w-[16.125rem]"
              >
                담당자에게 이메일 문의
              </Button>
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
