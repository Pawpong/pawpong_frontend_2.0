'use client'

import { useState } from 'react'
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
}

// 이미 SiteFooter에 공개돼 있는 지원 이메일과 같은 주소 — 새로 만든 값이 아니다
const SUPPORT_EMAIL = 'coldingcontact@gmail.com'

/**
 * 직접 문의 작성 모달 (Figma 4161:889794 · Q&A modal, exit-confirm 4161:889796).
 *
 * FAQ로 해결되지 않은 문의를 담당자에게 전달하는 흐름이지만, 사이트 문의를 접수하는 백엔드
 * API가 아직 없다(POST /api/v2/inquiry 는 브리더 대상 1:1 질문 게시판이라 목적이 다르다).
 * 그래서 "담당자 이메일로 전송"이라는 Figma 문구를 mailto 로 그대로 구현한다 — 이미 공개된
 * 지원 이메일(SiteFooter 와 동일)로 메일 작성 화면을 띄운다. 접수 API가 생기면 이 mailto 를
 * 실제 POST 호출로 교체한다.
 */
const InquiryModal = ({ open, onOpenChange }: InquiryModalProps) => {
  const [text, setText] = useState('')
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // 입력 중인 내용이 있으면 바로 닫지 않고 삭제 확인을 먼저 보여준다
  const requestClose = () => {
    if (text.trim()) {
      setShowExitConfirm(true)
      return
    }
    onOpenChange(false)
  }

  const discard = () => {
    setShowExitConfirm(false)
    setText('')
    onOpenChange(false)
  }

  const handleSend = () => {
    const subject = encodeURIComponent('[Pawpong 문의]')
    const body = encodeURIComponent(text.trim())
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    setText('')
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-modal flex w-[calc(100%-2rem)] max-w-[19.5rem] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] data-[state=closed]:opacity-0 data-[state=open]:opacity-100 tab:max-w-[39.75rem] pc:max-w-[64.125rem]"
          >
            <DialogPrimitive.Title className="sr-only">문의 작성</DialogPrimitive.Title>

            <div className="flex items-center justify-end px-3 py-2 tab:px-6 tab:py-3">
              <button
                type="button"
                onClick={requestClose}
                aria-label="닫기"
                className="rounded-lg p-1 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <CloseIcon className="size-5 tab:size-6" />
              </button>
            </div>

            <div className="px-3 pb-3 tab:px-6 tab:pb-4">
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="문의를 남겨주세요"
                className="h-52"
                autoFocus
              />
            </div>

            <div className="flex justify-end px-6 py-3">
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!text.trim()}
                className="h-10 w-full max-w-[16.125rem]"
              >
                보내기
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
