'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { WithdrawReason } from '@/shared/types'
import { Dialog, DialogOverlay, DialogPortal, Textarea, ctaModalButton } from '@/shared/ui'
import { CheckIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// 탈퇴 사유 옵션 (백엔드 AdopterWithdrawReason / Figma 설문 기준)
const WITHDRAW_REASONS: { value: WithdrawReason; label: string }[] = [
  { value: WithdrawReason.ALREADY_ADOPTED, label: '이미 입양을 마쳤어요' },
  { value: WithdrawReason.NO_SUITABLE_PET, label: '마음에 드는 아이가 없어요' },
  { value: WithdrawReason.ADOPTION_FEE_BURDEN, label: '입양비가 부담돼요' },
  { value: WithdrawReason.UNCOMFORTABLE_UI, label: '사용하기 불편했어요' },
  { value: WithdrawReason.PRIVACY_CONCERN, label: '개인정보나 보안이 걱정돼요' },
  { value: WithdrawReason.OTHER, label: '다른 이유로 탈퇴하고 싶어요' },
]

const OTHER_REASON_MAX_LENGTH = 200

interface WithdrawReasonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 사유 선택 완료 → 다음(확인) 단계로. reason='other'면 otherReason 동반. */
  onNext: (reason: WithdrawReason, otherReason?: string) => void
}

/**
 * 회원 탈퇴 사유 선택 모달 (기존 확인 모달 앞 단계).
 * 팀원의 CtaModal/확인 모달은 그대로 두고, 그 앞에 사유 설문 단계만 추가한다.
 * 컨테이너·버튼 스타일은 CtaModal 토큰(ctaModalButton, rounded-xl 등)을 재사용해 톤을 맞춘다.
 */
const WithdrawReasonModal = ({ open, onOpenChange, onNext }: WithdrawReasonModalProps) => {
  const [reason, setReason] = useState<WithdrawReason | null>(null)
  const [otherReason, setOtherReason] = useState('')

  // 모달을 닫을 때 선택 상태를 초기화해, 다시 열었을 때 이전 선택이 남지 않게 한다.
  // effect 대신 렌더 중 상태 동기화(React 권장 패턴) — open 전환을 감지해 초기화한다.
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) {
      setReason(null)
      setOtherReason('')
    }
  }

  const isOther = reason === WithdrawReason.OTHER
  const canProceed = reason !== null && (!isOther || otherReason.trim().length > 0)

  const handleNext = () => {
    if (!canProceed || reason === null) return
    onNext(reason, isOther ? otherReason.trim() : undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2.5rem)] max-w-[19.5rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl bg-white p-5 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 pc:max-w-[22.5rem]"
        >
          <DialogPrimitive.Title className="text-center text-xl leading-normal font-semibold text-[#3e3e3e]">
            탈퇴하는 이유를 알려주세요
          </DialogPrimitive.Title>

          {/* 단일 선택(라디오) 사유 목록 */}
          <div role="radiogroup" aria-label="탈퇴 사유" className="flex flex-col gap-2">
            {WITHDRAW_REASONS.map(({ value, label }) => {
              const selected = reason === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(value)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    selected
                      ? 'border-[#3e3e3e] bg-[#f5f5f5] text-[#3e3e3e]'
                      : 'border-[#e4e4e4] text-[#6b6b6b] hover:bg-[#f5f5f5]',
                  )}
                >
                  <span>{label}</span>
                  {selected && <CheckIcon className="size-4 shrink-0 text-[#3e3e3e]" />}
                </button>
              )
            })}
          </div>

          {/* 'other' 선택 시 상세 사유 입력 (백엔드에서 필수) */}
          {isOther && (
            <div className="flex flex-col gap-1">
              <Textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                maxLength={OTHER_REASON_MAX_LENGTH}
                placeholder="탈퇴 사유를 입력해주세요"
                state={otherReason.trim().length > 0 ? 'fill' : 'default'}
                className="h-[5rem]"
              />
              <p className="self-end text-[0.625rem] leading-[1.5] font-medium text-[#6b6b6b]">
                {otherReason.length}/{OTHER_REASON_MAX_LENGTH}
              </p>
            </div>
          )}

          {/* 하단 버튼 — 모바일·탭 세로 → pc 가로 (CtaModal responsive 규칙과 동일) */}
          <div className="flex flex-col-reverse gap-2 pc:flex-row pc:gap-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={ctaModalButton({ variant: 'outline' })}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                ctaModalButton({ variant: 'fill' }),
                !canProceed && 'cursor-not-allowed opacity-50',
              )}
            >
              다음
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { WithdrawReasonModal }
