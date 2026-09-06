'use client'

import { useState } from 'react'
import { getAccessToken, normalizeApiError } from '@/shared/api'
import { MoreVertIcon } from '@/shared/assets'
import type { CommunityReportReason } from '@/shared/types'
import {
  Button,
  CtaModal,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Dropdown,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  LoginPromptModal,
  TextareaField,
} from '@/shared/ui'
import { useReportCommunityPost } from '../api/community.mutations'

const REPORT_REASON_OPTIONS = [
  { value: 'spam', label: '스팸·광고' },
  { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
  { value: 'false_info', label: '거짓 정보' },
  { value: 'hateful_content', label: '혐오·괴롭힘' },
  { value: 'other', label: '기타' },
] satisfies { value: CommunityReportReason; label: string }[]

interface ReportPostActionProps {
  postId: string
}

/** 남의 게시글 ⋮ 메뉴와 신고 폼을 하나의 완결된 액션으로 제공한다. */
const ReportPostAction = ({ postId }: ReportPostActionProps) => {
  const reportPost = useReportCommunityPost(postId)
  const [formOpen, setFormOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [reason, setReason] = useState<CommunityReportReason | undefined>()
  const [description, setDescription] = useState('')
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const resetForm = () => {
    setReason(undefined)
    setDescription('')
    setValidationMessage(null)
    reportPost.reset()
  }

  const requestReport = () => {
    if (!getAccessToken()) {
      setLoginPromptOpen(true)
      return
    }
    setFormOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    if (reportPost.isPending) return
    setFormOpen(open)
    if (!open) resetForm()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reason) {
      setValidationMessage('신고 사유를 선택해주세요.')
      return
    }

    setValidationMessage(null)
    reportPost.mutate(
      { reason, description: description.trim() || undefined },
      {
        onSuccess: ({ reported }) => {
          setFormOpen(false)
          resetForm()
          setResultMessage(
            reported ? '신고가 접수되었습니다.' : '이미 접수된 신고입니다. 검토를 기다려주세요.',
          )
        },
      },
    )
  }

  const requestError = reportPost.error
    ? normalizeApiError(reportPost.error, '게시글 신고에 실패했습니다.').message
    : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="게시글 더보기"
            className="-m-2 flex size-10 shrink-0 items-center justify-center text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <MoreVertIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={requestReport}
            className="text-error-500 focus:text-error-600"
          >
            신고
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={formOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[22.5rem] gap-5">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle>게시글 신고</DialogTitle>
            <DialogDescription>
              신고 사유를 선택해주세요. 접수된 내용은 운영 정책에 따라 검토됩니다.
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-neutral-850">신고 사유</label>
              <Dropdown
                ariaLabel="신고 사유"
                options={REPORT_REASON_OPTIONS}
                value={reason}
                onValueChange={(value) => {
                  setReason(value as CommunityReportReason)
                  setValidationMessage(null)
                }}
                placeholder="사유를 선택해주세요"
                disabled={reportPost.isPending}
              />
              {validationMessage && (
                <p className="text-xs font-medium text-error-500">{validationMessage}</p>
              )}
            </div>

            <TextareaField
              label="상세 내용"
              placeholder="운영자가 확인할 내용을 입력해주세요 (선택)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              currentLength={description.length}
              maxLength={500}
              disabled={reportPost.isPending}
              className="h-28"
            />

            {requestError && (
              <p role="alert" className="text-sm font-medium text-error-500">
                {requestError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={reportPost.isPending}
                onClick={() => handleOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="fill"
                size="lg"
                className="flex-1"
                disabled={reportPost.isPending}
              >
                {reportPost.isPending ? '접수 중' : '신고하기'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        description="로그인하고 부적절한 게시글을 신고해주세요."
      />

      <CtaModal
        open={resultMessage !== null}
        onOpenChange={(open) => !open && setResultMessage(null)}
        title="신고 접수 완료"
        description={resultMessage ?? undefined}
        actions={[
          {
            label: '확인',
            variant: 'fill',
            onClick: () => setResultMessage(null),
          },
        ]}
      />
    </>
  )
}

export { ReportPostAction }
