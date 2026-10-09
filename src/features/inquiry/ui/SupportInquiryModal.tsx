'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
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
import { supportChatApi } from '../api/supportConversation.api'
import { SupportChatController } from '../model/supportChatController'
import {
  MAX_SUPPORT_MESSAGE_LENGTH,
  SUPPORT_TOPICS,
  type SupportTopic,
} from '../model/supportTopics'
import { useSupportViewport } from '../model/useSupportViewport'
import { SupportConversationView } from './SupportConversationView'

interface SupportInquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audience: 'adopter' | 'breeder'
  presentation?: 'dialog' | 'sheet'
  trigger?: ReactNode
  /** 처음 열 때 고를 주제 (레벨 안내의 문의 버튼은 레벨/EXP 로 연다) */
  initialTopic?: SupportTopic
}

const SupportChat = ({
  open,
  onOpenChange,
  audience,
  presentation = 'dialog',
  trigger,
  initialTopic = 'usage',
}: SupportInquiryModalProps) => {
  const [controller] = useState(() => new SupportChatController(supportChatApi, audience))
  const sessions = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )
  const [topic, setTopic] = useState<SupportTopic>(initialTopic)
  const [showReset, setShowReset] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const session = sessions[topic]
  const selectedTopic = SUPPORT_TOPICS.find((item) => item.id === topic)!
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const contentRef = useSupportViewport(open)
  const busy = session.phase !== 'idle'
  const awaitingSubmission = session.submissionRevision !== null
  const submission = session.conversation?.submission
  const conversationId = session.conversation?.conversationId
  const deliveryStatus = submission?.deliveryStatus
  const turns =
    session.conversation?.messages.filter((message) => message.role === 'user').length ?? 0
  const atLimit = turns >= 12

  useEffect(() => {
    if (open) return
    // 제어형 FAQ 진입점도 닫은 뒤 초점을 되돌린다. Safari는 포인터로 누른 버튼에
    // focus를 주지 않을 수 있어, 대화를 열기 직전의 버튼도 기억한다.
    const rememberOpener = (event: PointerEvent) => {
      if (event.target instanceof Element) {
        openerRef.current = event.target.closest<HTMLElement>('button, a')
      }
    }
    document.addEventListener('pointerdown', rememberOpener, true)
    return () => document.removeEventListener('pointerdown', rememberOpener, true)
  }, [open])

  useEffect(() => {
    if (!open || !conversationId || deliveryStatus !== 'pending') return
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void controller.refresh(topic)
    }, 10_000)
    return () => window.clearInterval(interval)
  }, [open, conversationId, deliveryStatus, controller, topic])

  const retry = () =>
    session.submissionRevision !== null
      ? void controller.submit(topic)
      : void controller.send(topic)
  const restart = () => {
    controller.restart(topic)
    setShowReset(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            ref={contentRef}
            onOpenAutoFocus={(event) => {
              const active = document.activeElement
              if (
                active instanceof HTMLElement &&
                active !== document.body &&
                !contentRef.current?.contains(active)
              )
                openerRef.current = active
              event.preventDefault()
              contentRef.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              if (openerRef.current?.isConnected) {
                event.preventDefault()
                openerRef.current.focus()
              }
            }}
            style={{
              height: 'min(46rem, calc(var(--support-viewport-height, 100dvh) - 1rem))',
              top:
                presentation === 'sheet'
                  ? 'calc(var(--support-viewport-top, 0px) + var(--support-viewport-height, 100dvh) - min(46rem, calc(var(--support-viewport-height, 100dvh) - 1rem)))'
                  : 'calc(var(--support-viewport-top, 0px) + var(--support-viewport-height, 100dvh) / 2)',
            }}
            className={cn(
              'fixed z-modal flex min-h-0 flex-col overflow-hidden bg-point-50 shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
              presentation === 'sheet'
                ? 'inset-x-0 rounded-t-2xl'
                : 'left-1/2 w-[calc(100%-2rem)] max-w-[39.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl',
            )}
          >
            <header className="shrink-0 border-b border-primary-100 bg-white px-4 py-3 tab:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-primary-700">
                  <PawPrintIcon aria-hidden className="size-6" />
                  <DialogPrimitive.Title className="font-cafe24 text-xl">
                    AI 문의하기
                  </DialogPrimitive.Title>
                </div>
                <IconButton
                  tone="brand"
                  size="touch"
                  onClick={() => onOpenChange(false)}
                  aria-label="AI 문의 닫기"
                >
                  <CloseIcon className="size-5" />
                </IconButton>
              </div>
              <DialogPrimitive.Description className="mt-1 text-xs leading-relaxed text-neutral-700">
                AI와 이야기하며 궁금한 점을 풀고, 필요한 문의를 운영팀에 전달해요.
              </DialogPrimitive.Description>
              <div role="group" aria-label="문의 유형" className="mt-3 grid grid-cols-4 gap-1">
                {SUPPORT_TOPICS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={topic === item.id}
                    onClick={() => setTopic(item.id)}
                    className={cn(
                      'min-h-11 rounded-lg border px-1 py-2 text-xs font-semibold focus-ring transition-colors motion-reduce:transition-none tab:text-sm',
                      topic === item.id
                        ? 'border-primary-500 bg-point-500 text-primary-700'
                        : 'border-neutral-150 bg-white text-neutral-700 hover:bg-point-50',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </header>

            <SupportConversationView
              key={topic}
              open={open}
              session={session}
              topic={selectedTopic}
              onSuggestion={(text) => {
                controller.setDraft(topic, text)
                textareaRef.current?.focus()
              }}
              onRetry={retry}
              onRefresh={() => void controller.refresh(topic)}
              onRestart={restart}
              onSubmit={() => void controller.submit(topic)}
            />

            <footer className="shrink-0 border-t border-primary-100 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] tab:px-6">
              {submission || atLimit ? (
                <div>
                  {atLimit && !submission && (
                    <p className="mb-2 text-sm text-neutral-700">
                      대화를 충분히 나눴어요. 정리한 내용을 전달하거나 새 문의를 시작해 주세요.
                    </p>
                  )}
                  {atLimit && !submission && !!session.draft.trim() && (
                    <div className="mb-3 rounded-lg border border-primary-100 bg-point-50 p-3">
                      <p className="text-xs font-semibold text-primary-700">
                        아직 보내지 않은 내용
                      </p>
                      <p className="mt-2 max-h-20 overflow-y-auto text-sm break-words whitespace-pre-wrap">
                        {session.draft}
                      </p>
                      <p className="my-2 text-xs leading-relaxed text-neutral-700">
                        새 문의에서 이어 쓸 수 있어요. 이 내용을 비우면 위에 정리한 문의를 전달할 수
                        있어요.
                      </p>
                      <Button
                        size="lg"
                        intent="secondary"
                        disabled={busy || awaitingSubmission}
                        onClick={() => setShowDiscard(true)}
                      >
                        작성 내용 비우기
                      </Button>
                    </div>
                  )}
                  <Button
                    size="lg"
                    intent="secondary"
                    width="full"
                    disabled={busy}
                    onClick={() => setShowReset(true)}
                  >
                    새 문의 시작
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!session.pendingTurn) void controller.send(topic)
                  }}
                >
                  {!session.conversation && (
                    <label className="mb-2 flex min-h-11 cursor-pointer items-center gap-2 text-xs leading-relaxed text-neutral-700">
                      <input
                        type="checkbox"
                        checked={session.consent}
                        disabled={busy}
                        onChange={(event) => controller.setConsent(topic, event.target.checked)}
                        className="size-5 shrink-0 accent-primary-500 focus-ring"
                      />
                      AI 상담을 위해 대화를 7일간 보관하는 데 동의해요.
                    </label>
                  )}
                  {awaitingSubmission && !busy && (
                    <p className="mb-2 text-xs leading-relaxed text-primary-700">
                      위의 다시 시도 버튼으로 접수 결과를 먼저 확인해 주세요.
                    </p>
                  )}
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      aria-label={`${selectedTopic.label} 메시지`}
                      value={session.draft}
                      onChange={(event) => controller.setDraft(topic, event.target.value)}
                      maxLength={MAX_SUPPORT_MESSAGE_LENGTH}
                      disabled={busy || awaitingSubmission}
                      placeholder={selectedTopic.placeholder}
                      className="h-20 min-h-12 text-base"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.ctrlKey || event.metaKey) &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault()
                          if (!session.pendingTurn) void controller.send(topic)
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        busy ||
                        awaitingSubmission ||
                        !session.draft.trim() ||
                        !session.consent ||
                        !!session.pendingTurn
                      }
                    >
                      전송
                    </Button>
                  </div>
                  <div className="mt-2 flex justify-between gap-3 text-xs leading-relaxed text-neutral-700">
                    <span>비밀번호·인증번호·결제정보는 적지 마세요.</span>
                    <span className="shrink-0">
                      {session.draft.length}/{MAX_SUPPORT_MESSAGE_LENGTH}
                    </span>
                  </div>
                </form>
              )}
            </footer>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
      <ExitConfirmModal
        open={showDiscard}
        onClose={() => setShowDiscard(false)}
        onConfirm={() => {
          controller.discardUnsentDraft(topic)
          setShowDiscard(false)
        }}
        title="보내지 않은 내용을 비울까요?"
        description="아직 보내지 않은 작성 내용만 지워져요. 지금까지의 대화와 정리한 문의는 그대로 남아요."
        closeLabel="계속 보관하기"
        confirmLabel="내용 비우기"
      />
      <ExitConfirmModal
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={restart}
        title="새 문의를 시작할까요?"
        description="현재 대화는 이 창에서 사라져요. 작성 중인 내용은 새 문의에 유지돼요. 이미 접수한 문의는 그대로 남아요."
        closeLabel="대화 계속하기"
        confirmLabel="새 문의 시작"
      />
    </>
  )
}

// 역할이 바뀌면 이전 역할의 대화와 미완료 요청을 새 화면에 이어 붙이지 않는다.
const SupportInquiryModal = (props: SupportInquiryModalProps) => (
  <SupportChat key={props.audience} {...props} />
)
export { SupportInquiryModal }
