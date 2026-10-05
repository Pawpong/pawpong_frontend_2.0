'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  analyticsEnabled,
  analyticsPage,
  analyticsReferrer,
  GTM_CONTAINER_ID,
} from './analyticsPolicy'

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  ReactNativeWebView?: { postMessage: (message: string) => void }
  __PAWPONG_APP__?: { platform?: string; capabilities?: { analytics?: boolean } }
}

/** WebView bridges screen views to Android; older binaries continue using the web stream. */
export function PawpongAnalytics() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)
  const previousPage = useRef<string | null>(null)
  const transport = useRef<'native' | 'web' | null>(null)

  useEffect(() => {
    const browser = window as AnalyticsWindow
    const debug = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
    if (!pathname || !analyticsEnabled(location.hostname, process.env.NEXT_PUBLIC_APP_ENV, debug))
      return

    const track = () => {
      if (document.visibilityState === 'hidden' || lastPath.current === pathname) return
      lastPath.current = pathname
      const page = analyticsPage(pathname)
      const safeUrl = `https://pawpong.kr${page?.path ?? '/untracked'}`
      const parameters = {
        page_location: safeUrl,
        page_title: page?.screen ?? 'untracked',
        page_referrer: previousPage.current ?? analyticsReferrer(document.referrer),
        app_platform: /PawpongApp\//.test(navigator.userAgent)
          ? /Android/.test(navigator.userAgent)
            ? 'android_webview'
            : 'ios_webview'
          : 'web',
        ...(debug ? { debug_mode: true } : {}),
      }
      // Update engagement context even on excluded authentication/callback routes.
      browser.gtag?.('set', parameters)
      if (!page) return
      previousPage.current = safeUrl

      // Lock the transport for this document so a late capability event never double counts.
      transport.current ??=
        browser.__PAWPONG_APP__?.platform === 'android' &&
        browser.__PAWPONG_APP__?.capabilities?.analytics &&
        browser.ReactNativeWebView
          ? 'native'
          : 'web'
      if (transport.current === 'native') {
        browser.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: 'ANALYTICS_SCREEN_VIEW',
            screen: page.screen,
          }),
        )
        return
      }

      browser.dataLayer ??= []
      browser.gtag ??= function () {
        browser.dataLayer!.push(arguments)
      }
      browser.gtag('set', parameters)
      browser.dataLayer.push(parameters)
      if (!document.getElementById('pawpong-gtm')) {
        browser.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
        const script = document.createElement('script')
        script.id = 'pawpong-gtm'
        script.async = true
        script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
        document.head.appendChild(script)
      }
      browser.dataLayer.push({ event: 'pawpong_page_view', ...parameters })
    }

    // Only the first view waits for RN's onLoad capability injection. Later committed
    // navigation must track immediately so quick visits/back navigation are not lost.
    const timer =
      transport.current === null && /PawpongApp\//.test(navigator.userAgent)
        ? window.setTimeout(track, 300)
        : undefined
    if (timer === undefined) track()
    document.addEventListener('visibilitychange', track)
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', track)
    }
  }, [pathname])

  return null
}
