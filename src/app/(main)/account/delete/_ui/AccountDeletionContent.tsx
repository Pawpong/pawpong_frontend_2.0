'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStatus } from '@/features/auth'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Label } from '@/shared/ui/Label'
import { deletionErrorMessage, type DeletionStatus } from '@/shared/lib/accountDeletion'
import { getDeletionStatus, requestAccountDeletion } from '@/features/account-deletion'

const STATUS_TEXT = {
  pending: {
    title: '영구삭제 요청을 접수했어요',
    description:
      '계정 이용이 중지되었어요. 데이터 삭제를 순서대로 시작해요. 기존 첨부파일의 소유 확인이 필요한 경우 운영 검토로 시간이 더 걸릴 수 있어요.',
  },
  processing: {
    title: '데이터를 영구삭제하고 있어요',
    description: '아직 삭제가 완료되지 않았어요. 페이지를 닫아도 서버에서 처리를 이어가요.',
  },
  retryable: {
    title: '삭제 처리를 다시 시도하고 있어요',
    description:
      '일부 데이터를 정리하는 중 연결이 지연되었어요. 서버가 자동으로 재시도하며, 완료되면 이곳에서 확인할 수 있어요.',
  },
  review_required: {
    title: '첨부파일 삭제 여부를 확인하고 있어요',
    description:
      '계정의 개인정보는 정리되었지만, 일부 기존 업로드 파일은 운영 확인이 필요해요. 아직 영구삭제가 완료된 상태는 아니에요. 처리 상태는 이곳에서 확인할 수 있어요.',
  },
  completed: {
    title: '영구삭제가 완료되었어요',
    description:
      '요청한 계정과 서비스 데이터의 영구삭제 처리가 완료되었어요. 이 계정은 복구할 수 없어요.',
  },
}

export function AccountDeletionContent() {
  const { isReady, isLoggedIn } = useAuthStatus()
  const queryClient = useQueryClient()
  const [receipt, setReceipt] = useState<DeletionStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [hasCheckedReceipt, setHasCheckedReceipt] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function check() {
      try {
        const status = await getDeletionStatus(controller.signal)
        if (!active) return
        setReceipt(status)
        setHasCheckedReceipt(true)
        setError('')
      } catch {
        if (active) setError('삭제 처리 상태를 불러오지 못했어요. 아래에서 다시 확인해 주세요.')
      } finally {
        if (active) setChecking(false)
      }
    }
    void check()
    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const processingStatus = receipt?.status
  useEffect(() => {
    if (!processingStatus || processingStatus === 'completed') return
    const controller = new AbortController()
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return
      void getDeletionStatus(controller.signal)
        .then((status) => {
          if (!controller.signal.aborted && status) {
            setReceipt(status)
            setError('')
          }
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setError('처리 상태를 확인하지 못했어요. 잠시 후 자동으로 다시 확인해요.')
        })
    }, 10_000)
    return () => {
      clearInterval(interval)
      controller.abort()
    }
  }, [processingStatus])

  async function refreshStatus() {
    setChecking(true)
    try {
      setReceipt(await getDeletionStatus())
      setHasCheckedReceipt(true)
      setError('')
    } catch {
      setError('삭제 처리 상태를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.')
    } finally {
      setChecking(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!agreed || submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      const status = await requestAccountDeletion(() => queryClient.clear())
      setReceipt(status)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : deletionErrorMessage(503))
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  async function closeReceipt() {
    const response = await fetch('/api/account-deletion/status', {
      method: 'DELETE',
      credentials: 'same-origin',
      cache: 'no-store',
    }).catch(() => null)
    if (response?.ok) {
      setReceipt(null)
      setAgreed(false)
    } else setError('조회 기록을 닫지 못했어요. 다시 시도해 주세요.')
  }

  return (
    <div className="flex flex-col gap-6">
      {receipt ? (
        <section
          className="rounded-xl border border-secondary-200 bg-secondary-50 p-5"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold text-neutral-850">
            {STATUS_TEXT[receipt.status].title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            {STATUS_TEXT[receipt.status].description}
          </p>
          <p className="mt-4 text-xs break-all text-neutral-700">접수 번호: {receipt.requestId}</p>
          <p className="mt-1 text-xs text-neutral-700">
            접수 일시: {new Date(receipt.requestedAt).toLocaleString('ko-KR')}
          </p>
          <p className="mt-4 text-sm text-neutral-700">
            같은 브라우저에서 이 페이지를 다시 열면 처리 상태를 확인할 수 있어요. 쿠키를 삭제하거나
            다른 기기를 쓰면 조회 기록이 표시되지 않아요.
          </p>
          {receipt.appleConnectionRemovalRequired && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-700">
              이 계정의 Apple 로그인 연결은 자동 해제할 수 없어 별도로 해제해야 해요.{' '}
              <a
                className="underline underline-offset-4"
                href="https://support.apple.com/102571"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple 계정 연결 해제 방법
              </a>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4 px-4"
            onClick={refreshStatus}
            disabled={checking}
          >
            처리 상태 확인
          </Button>
          {receipt.status === 'completed' && (
            <Button variant="text" className="mt-3" onClick={closeReceipt}>
              완료 내역 닫기
            </Button>
          )}
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-neutral-150 bg-white p-5">
            <h2 className="text-lg font-semibold text-neutral-850">삭제 전에 확인해 주세요</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-neutral-700">
              <li>
                영구삭제를 접수하면 계정 이용이 중지되고 로그인과 푸시 연결이 해제돼요. 이 요청은
                취소하거나 계정을 복구할 수 없어요.
              </li>
              <li>
                프로필과 개인정보, 내가 작성한 콘텐츠·첨부파일, 상담·입양 신청의 개인정보를
                삭제해요. 상대방이 작성한 원문은 남을 수 있어요. 서비스에 별도로 저장된 계정 정보
                사본은 정리해요.
              </li>
              <li>
                삭제는 접수 후 서버에서 진행해요. 처리 중 오류가 생기면 자동으로 다시 시도해요. 기존
                첨부파일의 소유 확인이 필요한 경우 운영 검토로 시간이 더 걸릴 수 있어요.
              </li>
              <li>
                법령에 따른 보존 대상과 기간은{' '}
                <Link href="/terms-of-privacy" className="underline underline-offset-4">
                  개인정보처리방침
                </Link>
                에서 확인해 주세요.
              </li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-neutral-700">
              복구 가능한 탈퇴를 원하면{' '}
              <Link href="/settings" className="underline underline-offset-4">
                설정의 계정 탈퇴
              </Link>
              를 이용해 주세요. 영구삭제는 별도의 작업이에요.
            </p>
          </section>
          {checking || !isReady || !hasCheckedReceipt ? (
            <p role="status" className="text-sm text-neutral-700">
              계정과 접수 내역을 확인하고 있어요.
            </p>
          ) : isLoggedIn ? (
            <form onSubmit={submit} className="flex flex-col gap-5" aria-busy={busy}>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="permanent-delete-confirmation"
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                  disabled={busy}
                />
                <Label
                  htmlFor="permanent-delete-confirmation"
                  className="pt-1 text-sm leading-relaxed"
                >
                  삭제할 데이터와 복구 불가 안내를 확인했으며, 현재 로그인한 계정의 영구삭제를
                  요청합니다.
                </Label>
              </div>
              <Button type="submit" size="lg" disabled={!agreed || busy}>
                {busy ? '삭제 요청을 접수하고 있어요…' : '계정 영구삭제 요청'}
              </Button>
            </form>
          ) : (
            <div className="rounded-xl bg-secondary-50 p-5 text-sm leading-relaxed text-neutral-700">
              <p>
                삭제할 계정으로 로그인해 주세요. 앱을 설치하지 않아도 이 웹페이지에서 요청할 수
                있어요.
              </p>
              <Link
                href="/login?returnUrl=%2Faccount%2Fdelete"
                className="mt-4 inline-block rounded-full bg-point-500 px-5 py-3 font-semibold text-neutral-850 hover:bg-point-300"
              >
                로그인하고 계속하기
              </Link>
            </div>
          )}
        </>
      )}
      {error && (
        <div role="alert" className="text-sm leading-relaxed text-error-500">
          <p>{error}</p>
          <Button variant="text" className="mt-2" disabled={checking} onClick={refreshStatus}>
            접수 내역 다시 확인
          </Button>
        </div>
      )}
      <p className="text-xs leading-relaxed text-neutral-500">
        접수 여부를 확인할 수 없거나 처리가 오래 지연되면 coldingcontact@gmail.com으로 문의해
        주세요. 비밀번호나 로그인 토큰을 보내지 마세요.
      </p>
    </div>
  )
}
