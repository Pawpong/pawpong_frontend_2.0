'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStatus } from '@/features/auth'
import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/ui'
import { ContentRightsContent } from './ContentRightsContent'

type NativeWindow = Window & { __PAWPONG_APP__?: unknown; ReactNativeWebView?: unknown }

/** 앱 안에서 기존 게시물이 있는 미동의 작성자에게만 다시 안내한다. */
export function AppContentRightsNotice() {
  const { isReady, isLoggedIn } = useAuthStatus()
  const pathname = usePathname()
  const [isApp, setIsApp] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [open, setOpen] = useState(false)
  const isConsentPage = pathname === '/account/content-rights'

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
    const controller = new AbortController()
    const refresh = () => {
      void apiClient
        .get(`${API_VERSION}/content-rights/me`, { signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return
          const status = unwrap<{ accepted: boolean; hasPublishedPosts?: boolean }>(response)
          const needed = !status.accepted && status.hasPublishedPosts === true
          setNeedsConsent(needed)
          setOpen(needed && !isConsentPage)
        })
        .catch(() => {
          /* 조회 실패는 미동의로 간주하지 않는다. 다음 화면·앱 복귀에서 재조회한다. */
        })
    }
    refresh()
    window.addEventListener('pawpong:content-rights-updated', refresh)
    window.addEventListener('pawpong:app-active', refresh)
    return () => {
      controller.abort()
      window.removeEventListener('pawpong:content-rights-updated', refresh)
      window.removeEventListener('pawpong:app-active', refresh)
    }
  }, [isApp, isReady, isLoggedIn, pathname, isConsentPage])

  if (!isApp || !isLoggedIn || !needsConsent) return null
  return (
    <>
      <aside className="border-y border-secondary-400 bg-secondary-50 px-4 py-3 text-sm text-neutral-850">
        <div className="mx-auto flex w-full max-w-[80rem] flex-wrap items-center justify-between gap-2">
          <span>동의해야 올린 게시글이 다른 앱 사용자에게 보여요.</span>
          <Link
            href="/account/content-rights"
            className="font-semibold text-primary-600 underline underline-offset-2"
          >
            앱 표시 동의하기
          </Link>
        </div>
      </aside>
      <Dialog open={open && !isConsentPage} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] max-w-168 overflow-y-auto p-4">
          <DialogTitle className="pr-8">내 게시글이 아직 앱에서 보이지 않아요</DialogTitle>
          <DialogDescription>
            게시물 앱 표시에 동의해야 올린 게시글을 다른 앱 사용자가 볼 수 있어요. 아래 내용을
            확인하고 직접 선택해주세요. 나중에 선택해도 돼요.
          </DialogDescription>
          <ContentRightsContent
            onConsented={() => {
              setNeedsConsent(false)
              setOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
