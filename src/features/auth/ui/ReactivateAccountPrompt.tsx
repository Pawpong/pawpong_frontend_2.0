'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { normalizeApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib/formatDate'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { saveAuthTokens } from '@/shared/lib/saveAuthTokens'
import { AlertMessage, CtaModal } from '@/shared/ui'
import { AlertCircleIcon } from '@/shared/assets'
import { useReactivateAccount } from '../api/auth.mutations'

/**
 * 탈퇴 계정 복구 확인 (소셜 로그인 콜백 → /login)
 *
 * 탈퇴한 계정으로 다시 소셜 로그인하면 백엔드가 차단 대신 복구 토큰을 실어 되돌려보낸다:
 *   /login?type=deleted_account&reactivationToken=<JWT>&expiresIn=600
 *         &message=...&role=...&email=...&name=...&deletedAt=...&returnUrl=...
 *
 * 여기서 확인을 받고 POST /api/v2/auth/reactivate 로 계정을 되살린다.
 * 새 계정을 만드는 게 아니라 기존 계정을 그대로 복구하는 것이라 계정 id 가 유지되고
 * 채팅방·입양신청·후기·즐겨찾기가 함께 살아난다 — 문구도 "재가입"이 아닌 "복구"로 쓴다.
 *
 * 복구 대상이 아닌 차단(정지 계정 등)은 기존처럼 reactivationToken 없이
 * `error` 파라미터만 실려 오므로, 그 경우엔 사유만 안내하고 끝낸다.
 */

/** 복구 토큰 유효시간 기본값 — 콜백이 expiresIn 을 안 실어줄 때만 사용 */
const DEFAULT_EXPIRES_IN_SEC = 600

const EXPIRED_MESSAGE = '복구 요청이 만료되었습니다. 다시 로그인해주세요.'

/** 서버에 닿지 못했을 때 — axios 의 'Network Error' 가 그대로 노출되는 것을 막는다 */
const REQUEST_FAILED_MESSAGE = '계정 복구에 실패했습니다. 잠시 후 다시 시도해주세요.'

const formatRemaining = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const ErrorNotice = ({ text }: { text: string }) => (
  <AlertMessage
    status="error"
    size="responsive"
    icon={AlertCircleIcon}
    message={text}
    className="justify-center"
  />
)

const ReactivateAccountPrompt = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reactivate = useReactivateAccount()

  const isDeletedAccount = searchParams.get('type') === 'deleted_account'
  const reactivationToken = searchParams.get('reactivationToken')
  // 복구 안내는 message, 복구 불가 차단 사유는 error 로 온다 (백엔드 콜백 규약)
  const message = searchParams.get('message')
  const blockedReason = searchParams.get('error')
  const email = searchParams.get('email')
  const name = searchParams.get('name')
  const deletedAt = searchParams.get('deletedAt')
  const returnUrl = normalizeReturnUrl(searchParams.get('returnUrl'))

  const canReactivate = isDeletedAccount && Boolean(reactivationToken)

  const [dismissed, setDismissed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 남은 시간 — 콜백 직후 진입이라 페이지 진입 시각을 토큰 발급 시각으로 본다.
  const initialRemaining = useMemo(() => {
    const parsed = Number(searchParams.get('expiresIn'))
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_EXPIRES_IN_SEC
  }, [searchParams])
  const [remaining, setRemaining] = useState(initialRemaining)

  useEffect(() => {
    if (!canReactivate) return
    // 0 에서는 같은 값을 반환해 리렌더를 멈춘다
    const timer = setInterval(() => setRemaining((prev) => (prev > 0 ? prev - 1 : prev)), 1000)
    return () => clearInterval(timer)
  }, [canReactivate])

  // 만료·에러 상태는 effect 없이 파생시킨다 (서버도 같은 시점부터 401 을 준다)
  const isExpired = canReactivate && remaining <= 0
  const displayError = errorMessage ?? (isExpired ? EXPIRED_MESSAGE : null)
  const open = canReactivate && !dismissed && !displayError

  /** 복구 토큰을 URL 에 남겨두지 않는다 — 새로고침 시 재확인·유출 방지 */
  const handleCancel = () => {
    setDismissed(true)
    router.replace('/login')
  }

  const handleConfirm = async () => {
    if (!reactivationToken || reactivate.isPending) return

    try {
      const { accessToken, refreshToken } = await reactivate.mutateAsync(reactivationToken)
      const saved = await saveAuthTokens({ accessToken, refreshToken })

      setDismissed(true)
      // 복구는 됐는데 쿠키 저장만 실패한 경우 — 계정은 살아났으니 로그인만 다시 시킨다
      router.replace(saved ? returnUrl : '/login')
    } catch (error) {
      // 서버가 준 도메인 에러(토큰 만료·정지 계정 등)는 그대로 보여준다.
      // 반면 네트워크 실패는 status 가 없고 axios 가 'Network Error' 를 message 에 넣어
      // 영문이 그대로 노출되므로, 그때만 안내 문구로 갈아끼운다.
      const apiError = normalizeApiError(error, REQUEST_FAILED_MESSAGE)
      setErrorMessage(apiError.status ? apiError.message : REQUEST_FAILED_MESSAGE)
    }
  }

  // 복구 대상이 아닌 차단(정지 계정 등) — 사유만 알린다
  if (isDeletedAccount && !reactivationToken) {
    return <ErrorNotice text={blockedReason ?? message ?? '이 계정으로는 로그인할 수 없습니다.'} />
  }

  if (!canReactivate) return null

  return (
    <>
      {displayError && <ErrorNotice text={displayError} />}

      <CtaModal
        open={open}
        onOpenChange={(next) => {
          if (!next) handleCancel()
        }}
        showClose={false}
        direction="responsive-reverse"
        title="탈퇴한 계정이에요. 복구할까요?"
        description={
          <span className="flex flex-col gap-2">
            <span>
              {message ?? '탈퇴한 계정입니다. 복구 후 이용하시겠습니까?'}
              <br />
              복구하면 이전에 쓰던 채팅·입양신청·후기가 그대로 살아나요.
            </span>

            {(name || email || deletedAt) && (
              <span className="flex flex-col text-sm text-neutral-700">
                {name && <span>{name}</span>}
                {email && <span>{email}</span>}
                {deletedAt && <span>탈퇴일 {formatDate(deletedAt)}</span>}
              </span>
            )}

            <span className="text-sm text-neutral-700">
              남은 시간 {formatRemaining(remaining)} — 지나면 다시 로그인해야 해요.
            </span>
          </span>
        }
        actions={[
          { label: '취소', variant: 'outline', onClick: handleCancel },
          {
            label: reactivate.isPending ? '복구 중...' : '복구하기',
            variant: 'fill',
            onClick: handleConfirm,
            disabled: reactivate.isPending,
          },
        ]}
      />
    </>
  )
}

export { ReactivateAccountPrompt }
