'use client'

import { useEffect } from 'react'

/**
 * 루트 레이아웃의 첫 페인트 스크립트가 붙인 <html data-app> 을 마운트 뒤에 한 번 더 붙인다.
 * 하이드레이션이 깨져 React 가 화면을 처음부터 다시 그리면 <html> 의 속성을 모두 지우는데,
 * 그러면 앱에서 숨겨야 할 사이트 푸터 같은 웹 전용 UI(in-data-app:hidden)가 앱에 다시 보인다.
 * 판단식은 루트 레이아웃의 APP_DETECT_SCRIPT 와 같다 (RN 웹뷰 UA 의 PawpongApp/).
 */
export function AppFlagBridge() {
  useEffect(() => {
    if (/PawpongApp\//.test(navigator.userAgent)) document.documentElement.dataset.app = ''
  }, [])
  return null
}
