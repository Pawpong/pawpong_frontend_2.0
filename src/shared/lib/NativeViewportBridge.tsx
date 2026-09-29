'use client'

import { useEffect } from 'react'

type AppWindow = Window & { ReactNativeWebView?: unknown }
const APP_VIEWPORT = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'

/** 앱 안에서만 페이지 확대를 막는다. 일반 브라우저와 외부 OAuth 페이지에는 적용하지 않는다. */
export function NativeViewportBridge() {
  useEffect(() => {
    let cleanup: (() => void) | undefined
    const activate = () => {
      if (cleanup || !(window as AppWindow).ReactNativeWebView) return
      const root = document.documentElement
      const previousNativeViewport = root.getAttribute('data-native-viewport')
      root.setAttribute('data-native-viewport', '')
      const existing = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
      const originalContent = existing?.getAttribute('content') ?? null
      let meta = existing ?? document.createElement('meta')
      meta.name = 'viewport'
      const lock = () => {
        meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]') ?? meta
        if (meta.getAttribute('content') !== APP_VIEWPORT) meta.setAttribute('content', APP_VIEWPORT)
        if (!meta.isConnected) document.head.append(meta)
      }
      lock()
      // Next가 페이지 이동 중 viewport를 갱신해도 앱의 배율은 유지한다.
      const observer = new MutationObserver(lock)
      observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] })
      const preventPinch = (event: Event) => event.preventDefault()
      const preventMultiTouch = (event: TouchEvent) => {
        if (event.touches.length > 1) event.preventDefault()
      }
      const previousTouchAction = document.documentElement.style.touchAction
      document.documentElement.style.touchAction = 'pan-x pan-y'
      document.addEventListener('gesturestart', preventPinch, { passive: false })
      document.addEventListener('gesturechange', preventPinch, { passive: false })
      document.addEventListener('touchmove', preventMultiTouch, { passive: false })
      cleanup = () => {
        if (previousNativeViewport === null) root.removeAttribute('data-native-viewport')
        else root.setAttribute('data-native-viewport', previousNativeViewport)
        observer.disconnect()
        document.removeEventListener('gesturestart', preventPinch)
        document.removeEventListener('gesturechange', preventPinch)
        document.removeEventListener('touchmove', preventMultiTouch)
        document.documentElement.style.touchAction = previousTouchAction
        if (!existing) meta.remove()
        else if (originalContent === null) meta.removeAttribute('content')
        else meta.setAttribute('content', originalContent)
      }
    }
    activate()
    window.addEventListener('pawpong:app-ready', activate)
    return () => {
      window.removeEventListener('pawpong:app-ready', activate)
      cleanup?.()
    }
  }, [])
  return null
}
