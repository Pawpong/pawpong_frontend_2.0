import {
  analyticsEnabled,
  analyticsPage,
  analyticsReferrer,
  GTM_CONTAINER_ID,
} from './analyticsPolicy'

/** Fixed vocabulary only: no account IDs, form values, post text, URLs or search terms. */
export const ANALYTICS_ACTIONS = {
  sign_up: ['adopter', 'breeder'],
  generate_lead: ['adoption_application'],
  pawpong_chat_open: ['chat'],
  pawpong_post_publish: ['community'],
  pawpong_play_start: ['outing', 'taste', 'bti'],
  pawpong_play_complete: ['outing', 'taste', 'bti'],
  share: ['outing', 'taste', 'bti'],
} as const
export type AnalyticsAction = keyof typeof ANALYTICS_ACTIONS
type ActionContext<T extends AnalyticsAction> = (typeof ANALYTICS_ACTIONS)[T][number]

export function analyticsAction(name: unknown, context: unknown, method?: unknown) {
  if (typeof name !== 'string' || !Object.hasOwn(ANALYTICS_ACTIONS, name)) return null
  const options: readonly string[] = ANALYTICS_ACTIONS[name as AnalyticsAction]
  if (typeof context !== 'string' || !options.includes(context)) return null
  if (name === 'share' && method !== 'native' && method !== 'clipboard') return null
  return {
    analytics_event: name,
    action_context: context,
    // Explicitly clear the previous event's method in GTM's persistent data model.
    method: name === 'share' ? (method as 'native' | 'clipboard') : '',
  }
}

type AnalyticsBrowser = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __pawpongAnalyticsTransport?: 'native' | 'web'
  __PAWPONG_APP__?: {
    platform?: string
    capabilities?: { analytics?: boolean; analyticsEvents?: boolean }
  }
  ReactNativeWebView?: { postMessage: (message: string) => void }
}

/** Analytics is best effort and must never turn a completed save into a UI error. */
export function trackAction<T extends AnalyticsAction>(
  name: T,
  context: ActionContext<T>,
  method?: 'native' | 'clipboard',
): void {
  try {
    if (typeof window === 'undefined') return
    const debug = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
    if (!analyticsEnabled(location.hostname, process.env.NEXT_PUBLIC_APP_ENV, debug)) return
    const event = analyticsAction(name, context, method)
    if (!event) return
    const browser = window as AnalyticsBrowser
    const native =
      browser.__pawpongAnalyticsTransport === 'native' ||
      (browser.__pawpongAnalyticsTransport === undefined &&
        browser.__PAWPONG_APP__?.platform === 'android' &&
        browser.__PAWPONG_APP__?.capabilities?.analytics &&
        browser.ReactNativeWebView)
    if (native) {
      // Old native binaries only understand screen views. Never also load web analytics.
      if (browser.__PAWPONG_APP__?.capabilities?.analyticsEvents)
        browser.ReactNativeWebView?.postMessage(
          JSON.stringify({ type: 'ANALYTICS_EVENT', ...event }),
        )
      return
    }
    browser.__pawpongAnalyticsTransport = 'web'
    const page = analyticsPage(location.pathname)
    const parameters = {
      page_location: `https://pawpong.kr${page?.path ?? '/untracked'}`,
      page_title: page?.screen ?? 'untracked',
      page_referrer: analyticsReferrer(document.referrer),
      app_platform: /PawpongApp\//.test(navigator.userAgent)
        ? /Android/.test(navigator.userAgent)
          ? 'android_webview'
          : 'ios_webview'
        : 'web',
      ...(debug ? { debug_mode: true } : {}),
    }
    browser.dataLayer ??= []
    browser.gtag ??= function () {
      browser.dataLayer!.push(arguments)
    }
    browser.gtag('set', parameters)
    if (!document.getElementById('pawpong-gtm')) {
      browser.dataLayer.push({ ...parameters, 'gtm.start': Date.now(), event: 'gtm.js' })
      const script = document.createElement('script')
      script.id = 'pawpong-gtm'
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
      document.head.appendChild(script)
    }
    browser.dataLayer.push({ event: 'pawpong_action', ...parameters, ...event })
  } catch {
    /* Collection/bridge/storage failures must not affect the product. */
  }
}
