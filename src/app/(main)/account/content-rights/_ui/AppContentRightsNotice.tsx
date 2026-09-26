'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStatus } from '@/features/auth'
import { apiClient, API_VERSION, unwrap } from '@/shared/api'

type NativeWindow = Window & { __PAWPONG_APP__?: unknown; ReactNativeWebView?: unknown }

export function AppContentRightsNotice() {
  const { isReady, isLoggedIn } = useAuthStatus()
  const [isApp, setIsApp] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(false)

  useEffect(() => {
    const detect = () => {
      const native = window as NativeWindow
      setIsApp(Boolean(native.ReactNativeWebView && native.__PAWPONG_APP__))
    }
    detect()
    window.addEventListener('pawpong:app-ready', detect)
    return () => window.removeEventListener('pawpong:app-ready', detect)
  }, [])

  useEffect(() => {
    if (!isApp || !isReady || !isLoggedIn) return
    let active = true
    const refresh = () => {
      void apiClient.get(`${API_VERSION}/content-rights/me`)
        .then((response) => {
          const status = unwrap<{ accepted: boolean }>(response)
          if (active) setNeedsConsent(!status.accepted)
        })
        .catch(() => { if (active) setNeedsConsent(true) })
    }
    refresh()
    window.addEventListener('pawpong:content-rights-updated', refresh)
    return () => {
      active = false
      window.removeEventListener('pawpong:content-rights-updated', refresh)
    }
  }, [isApp, isReady, isLoggedIn])

  if (!needsConsent) return null
  return (
    <aside className="border-y border-secondary-400 bg-secondary-50 px-4 py-3 text-sm text-neutral-850">
      <div className="mx-auto flex w-full max-w-[80rem] flex-wrap items-center justify-between gap-2">
        <span>내 기존 게시물은 아직 앱에 공개되지 않았어요.</span>
        <Link href="/account/content-rights" className="font-semibold text-primary-600 underline underline-offset-2">
          앱 표시 동의하기
        </Link>
      </div>
    </aside>
  )
}
