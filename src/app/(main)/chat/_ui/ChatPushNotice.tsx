'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuthStatus } from '@/features/auth'
import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import { getAccessToken } from '@/shared/api/token'
import {
  getNativeNotificationPermission,
  hasNativeCapability,
  openNativeNotificationSettings,
} from '@/shared/lib/nativeBridge'
import { CtaModal } from '@/shared/ui'

type NativeWindow = Window & {
  __PAWPONG_APP__?: unknown
  ReactNativeWebView?: { postMessage: (message: string) => void }
}
const DISMISSED_KEY = 'pawpong:push-guide:dismissed-at'
const DAY_MS = 24 * 60 * 60 * 1000
const registration = (signal: AbortSignal) =>
  apiClient
    .get(`${API_VERSION}/notification/push-status`, { signal, timeout: 5_000 })
    .then((response) => unwrap<{ registered: boolean }>(response).registered)

/** 구 앱은 계정 등록 여부, 지원 앱은 실제 OS 권한으로 안내한다. */
export function ChatPushNotice() {
  const { isReady, isLoggedIn } = useAuthStatus()
  const [mode, setMode] = useState<'off' | 'unregistered' | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const lifetime = useRef<AbortController | null>(null)
  const sequence = useRef(0)

  useEffect(() => {
    if (!isReady || !isLoggedIn) return
    const controller = new AbortController()
    lifetime.current = controller
    const check = async () => {
      const native = window as NativeWindow
      if (!native.__PAWPONG_APP__ || !native.ReactNativeWebView) return
      const request = ++sequence.current
      try {
        const granted = hasNativeCapability('notificationPermission')
          ? await getNativeNotificationPermission()
          : null
        const registered = granted === false ? false : await registration(controller.signal)
        if (controller.signal.aborted || request !== sequence.current) return
        const next = granted === false ? 'off' : registered ? null : 'unregistered'
        setMode(next)
        if (!next) {
          setOpen(false)
          setFeedback('')
          return
        }
        let dismissed = false
        try {
          dismissed = Date.now() - Number(sessionStorage.getItem(DISMISSED_KEY) ?? 0) < DAY_MS
        } catch {
          /* 저장을 허용하지 않아도 안내는 동작한다. */
        }
        if (!dismissed) setOpen(true)
      } catch {
        /* 연결 실패·지원 앱의 권한 조회 실패를 알림 거부로 간주하지 않는다. */
      }
    }
    // 첫 로그인 때 기존 앱의 자동 FCM 등록이 먼저 끝날 시간을 준다.
    const timer = window.setTimeout(() => void check(), 5_000)
    const resume = () => void check()
    window.addEventListener('pawpong:app-active', resume)
    window.addEventListener('pawpong:app-ready', resume)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      window.removeEventListener('pawpong:app-active', resume)
      window.removeEventListener('pawpong:app-ready', resume)
    }
  }, [isReady, isLoggedIn])

  const dismiss = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      /* 저장 실패는 닫기를 막지 않는다. */
    }
  }
  const enable = async () => {
    const controller = lifetime.current
    if (!controller || controller.signal.aborted || busy) return
    setBusy(true)
    setFeedback('')
    try {
      if (mode === 'off' && hasNativeCapability('notificationSettings')) {
        await openNativeNotificationSettings()
        if (!controller.signal.aborted)
          setFeedback('설정에서 알림을 허용한 뒤 포퐁으로 돌아와 주세요.')
        return
      }
      const token = getAccessToken()
      const native = window as NativeWindow
      if (!token || !native.ReactNativeWebView) throw new Error('session unavailable')
      native.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'REQUEST_FCM_TOKEN', accessToken: token }),
      )
      for (let i = 0; i < 6; i++) {
        if (controller.signal.aborted) return
        if (await registration(controller.signal)) {
          setOpen(false)
          setMode(null)
          return
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1_000))
      }
      if (!controller.signal.aborted)
        setFeedback(
          '아직 등록이 확인되지 않았어요. 기기 설정에서 포퐁 알림을 허용한 뒤 다시 확인해주세요.',
        )
    } catch {
      if (!controller.signal.aborted)
        setFeedback('확인하지 못했어요. 연결 상태와 기기 설정을 확인하고 다시 시도해주세요.')
    } finally {
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  if (!isLoggedIn || !mode) return null
  return (
    <CtaModal
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss()
      }}
      title={mode === 'off' ? '채팅 알림이 꺼져 있어요' : '채팅 알림을 놓치지 마세요'}
      description={
        <>
          {mode === 'off'
            ? '알림을 켜두면 새 채팅과 내 게시글 소식을 바로 받을 수 있어요.'
            : '포퐁 앱의 푸시 등록이 아직 확인되지 않았어요. 알림을 켜두면 새 채팅과 내 게시글 소식을 받을 수 있어요.'}
          <span className="mt-2 block text-sm font-normal text-neutral-600">
            기기 설정에서 포퐁 → 알림 → 알림 허용을 확인해주세요.
          </span>
          {feedback && (
            <span role="status" className="mt-2 block text-sm text-primary-700">
              {feedback}
            </span>
          )}
        </>
      }
      actions={[
        {
          label: busy
            ? '확인 중…'
            : mode === 'off' && hasNativeCapability('notificationSettings')
              ? '알림 설정 열기'
              : '알림 등록 다시 확인',
          intent: 'primary',
          disabled: busy,
          onClick: () => void enable(),
        },
        { label: '지금은 괜찮아요', intent: 'secondary', onClick: dismiss },
      ]}
    />
  )
}
