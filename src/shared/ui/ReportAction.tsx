'use client'

import { useId, useState, type FormEvent } from 'react'
import { getAccessToken, normalizeApiError } from '@/shared/api'
import { MoreVertIcon } from '@/shared/assets'
import { Button } from './Button'
import { CtaModal } from './CtaModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu'
import { LoginPromptModal } from './LoginPromptModal'
import { TextareaField } from './TextareaField'

interface ReportActionProps<Reason extends string> {
  targetLabel: string
  options: readonly { value: Reason; label: string }[]
  onSubmit: (data: { reason: Reason; description?: string }) => Promise<string>
  requireOtherDescription?: boolean
}

/** 신고 대상별 API와 사유만 주입하는 공통 신고 흐름. */
export const ReportAction = <Reason extends string>({
  targetLabel,
  options,
  onSubmit,
  requireOtherDescription = false,
}: ReportActionProps<Reason>) => {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  // [refactored] 사유는 options 의 value 로만 좁혀 두어, 제출 시 역조회(find) 없이 그대로 넘긴다
  const [reason, setReason] = useState<Reason | ''>('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  // [refactored] 제출 중 상태를 pending 하나로 (ref 와 state 로 나뉘어 있던 것을 통합)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const descriptionRequired = requireOtherDescription && reason === 'other'

  const resetForm = () => {
    setReason('')
    setDescription('')
    setError(null)
  }

  const changeOpen = (next: boolean) => {
    if (pending) return
    setOpen(next)
    if (!next) resetForm()
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    if (!reason) {
      setError('신고 사유를 선택해주세요.')
      return
    }
    if (descriptionRequired && !description.trim()) {
      setError('기타 사유의 상세 내용을 입력해주세요.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const message = await onSubmit({
        reason,
        description: description.trim() || undefined,
      })
      // [refactored] pending 이 아직 true 라 changeOpen 이 막히므로 직접 닫는다
      setOpen(false)
      resetForm()
      setResult(message)
    } catch (cause) {
      setError(normalizeApiError(cause, '신고 접수에 실패했습니다. 다시 시도해주세요.').message)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${targetLabel} 더보기`}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-neutral-850 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <MoreVertIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => (getAccessToken() ? changeOpen(true) : setLoginOpen(true))}
            className="text-error-500 focus:text-error-600"
          >
            신고
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          overlayClassName="z-confirm"
          closeDisabled={pending}
          className="z-confirm max-h-[calc(100dvh-2.5rem)] max-w-[22.5rem] overflow-y-auto"
        >
          <DialogHeader className="pr-6 text-left">
            <DialogTitle>{targetLabel} 신고</DialogTitle>
            <DialogDescription>
              신고 사유를 선택해주세요.
              <br />
              접수된 내용은 운영 정책에 따라 검토됩니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} aria-busy={pending} className="flex flex-col gap-4">
            <fieldset disabled={pending} className="min-w-0">
              <legend className="mb-1 p-0.5 text-sm font-semibold text-neutral-850">
                신고 사유 <span className="font-medium text-neutral-700">필수</span>
              </legend>
              <div className="flex flex-col">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-neutral-850 hover:bg-neutral-50 has-disabled:cursor-not-allowed has-disabled:opacity-50"
                  >
                    <input
                      type="radio"
                      name={`${id}-reason`}
                      value={option.value}
                      checked={reason === option.value}
                      onChange={() => {
                        setReason(option.value)
                        setError(null)
                      }}
                      className="size-5 shrink-0 appearance-none rounded-full border border-neutral-400 bg-white checked:border-primary-500 checked:bg-primary-500 checked:shadow-[inset_0_0_0_0.25rem_white] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextareaField
              label={descriptionRequired ? '상세 내용' : '상세 내용 (선택)'}
              aria-label="신고 상세 내용"
              required={descriptionRequired}
              aria-required={descriptionRequired}
              placeholder={
                descriptionRequired
                  ? '신고 사유를 자세히 입력해주세요'
                  : '운영자가 확인할 내용을 입력해주세요'
              }
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setError(null)
              }}
              currentLength={description.length}
              maxLength={500}
              disabled={pending}
              className="h-28"
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-error-500">
                {error}
              </p>
            )}
            <div className="flex gap-4 pt-1">
              <Button
                variant="outline"
                className="h-10 flex-1"
                disabled={pending}
                onClick={() => changeOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" variant="primary" className="h-10 flex-1" disabled={pending}>
                {pending ? '접수 중' : '신고하기'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <LoginPromptModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        description="신고 기능은 로그인 후 이용할 수 있어요."
      />
      <CtaModal
        open={result !== null}
        onOpenChange={(next) => !next && setResult(null)}
        title="신고 접수 완료"
        description={result ?? undefined}
        actions={[{ label: '확인', variant: 'fill', onClick: () => setResult(null) }]}
      />
    </>
  )
}
